using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services;

public interface IConfigurationService
{
    Task<ApplyResultDto> ApplyConfigurationAsync(string yamlContent, string? actor = null, string? note = null);
    Task<List<ConfigurationVersionDto>> GetVersionsAsync();
    Task<string?> GetVersionContentAsync(string versionId);
    Task<string?> GetCurrentConfigurationAsync();
    Task<ApplyResultDto> PreviewChangesAsync(string yamlContent);
}

public sealed class ConfigurationService : IConfigurationService
{
    private readonly PulseDbContext _context;
    private readonly ConfigurationParser _parser;
    private readonly IPathService _pathService;

    public ConfigurationService(PulseDbContext context, ConfigurationParser parser, IPathService pathService)
    {
        _context = context;
        _parser = parser;
        _pathService = pathService;
    }

    public async Task<ApplyResultDto> ApplyConfigurationAsync(string yamlContent, string? actor = null, string? note = null)
    {
        (ConfigurationYaml? configuration, ValidationErrorsDto? validationErrors) = await _parser.ParseAndValidateAsync(yamlContent);
        if (validationErrors != null)
        {
            throw new ConfigurationValidationException(validationErrors);
        }

        if (configuration == null)
        {
            throw new InvalidOperationException("Configuration parsing returned null");
        }

        string fileHash = ComputeHash(yamlContent);
        ConfigVersion? existingVersion = await _context.ConfigVersions
            .FirstOrDefaultAsync(cv => cv.FileHash == fileHash);

        if (existingVersion != null)
        {
            return new ApplyResultDto
            {
                ConfigVersionId = existingVersion.Id,
                Added = 0,
                Updated = 0,
                Removed = 0,
                Warnings = new() { "Configuration already applied - no changes made" }
            };
        }

        (List<Group> groups, List<Data.Endpoint> endpoints) = _parser.ConvertToEntities(configuration!);

        using Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            (int Added, int Updated, int Removed) changes = await ApplyChangesToDatabaseAsync(groups, endpoints);

            string versionId = GenerateVersionId();
            long timestamp = UnixTimestamp.Now();
            DateTimeOffset displayTime = UnixTimestamp.FromUnixSeconds(timestamp);
            string fileName = $"{displayTime:yyyyMMdd_HHmmss}_{fileHash[..8]}.yaml";
            string filePath = Path.Combine(_pathService.GetVersionsDirectory(), fileName);

            await File.WriteAllTextAsync(filePath, yamlContent);

            var configVersion = new ConfigVersion
            {
                Id = versionId,
                AppliedTs = timestamp,
                FileHash = fileHash,
                FilePath = filePath,
                Actor = actor,
                Note = note
            };

            _context.ConfigVersions.Add(configVersion);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new ApplyResultDto
            {
                ConfigVersionId = versionId,
                Added = changes.Added,
                Updated = changes.Updated,
                Removed = changes.Removed,
                Warnings = new()
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<ConfigurationVersionDto>> GetVersionsAsync()
    {
        List<ConfigurationVersionDto> versions = await _context.ConfigVersions
            .Select(cv => new ConfigurationVersionDto
            {
                Id = cv.Id,
                AppliedTs = UnixTimestamp.FromUnixSeconds(cv.AppliedTs),
                FileHash = cv.FileHash,
                FilePath = cv.FilePath,
                Actor = cv.Actor,
                Note = cv.Note
            })
            .ToListAsync();

        return versions.OrderByDescending(cv => cv.AppliedTs).ToList();
    }

    public async Task<string?> GetVersionContentAsync(string versionId)
    {
        ConfigVersion? version = await _context.ConfigVersions
            .FirstOrDefaultAsync(cv => cv.Id == versionId);

        if (version == null || !File.Exists(version.FilePath))
        {
            return null;
        }

        return await File.ReadAllTextAsync(version.FilePath);
    }

    public async Task<string?> GetCurrentConfigurationAsync()
    {
        string versionsDir = _pathService.GetVersionsDirectory();

        // Get the latest version YAML file from the versions directory
        if (Directory.Exists(versionsDir))
        {
            var latestFile = new DirectoryInfo(versionsDir)
                .GetFiles("*.yaml")
                .OrderByDescending(f => f.CreationTimeUtc)
                .FirstOrDefault();
            // If a version file exists, load and return its content
            if (latestFile != null && latestFile.Exists)
                return await File.ReadAllTextAsync(latestFile.FullName);
        }

        //Fall back to the default config.yaml in the config directory
        string configPath = _pathService.GetConfigFilePath();
        if (File.Exists(configPath))
            return await File.ReadAllTextAsync(configPath);

        return null;
    }

    public async Task<ApplyResultDto> PreviewChangesAsync(string yamlContent)
    {
        (ConfigurationYaml? configuration, ValidationErrorsDto? validationErrors) = await _parser.ParseAndValidateAsync(yamlContent);
        if (validationErrors != null)
        {
            throw new ConfigurationValidationException(validationErrors);
        }

        if (configuration == null)
        {
            throw new InvalidOperationException("Configuration parsing returned null");
        }

        (List<Group> groups, List<Data.Endpoint> endpoints) = _parser.ConvertToEntities(configuration!);

        List<Group> existingGroups = await _context.Groups.ToListAsync();
        List<Data.Endpoint> existingEndpoints = await _context.Endpoints.ToListAsync();

        (int Added, int Updated, int Removed) groupChanges = CalculateGroupChanges(existingGroups, groups);
        (int Added, int Updated, int Removed) endpointChanges = CalculateEndpointChanges(existingEndpoints, endpoints);

        return new ApplyResultDto
        {
            ConfigVersionId = "dry-run-preview",
            Added = groupChanges.Added + endpointChanges.Added,
            Updated = groupChanges.Updated + endpointChanges.Updated,
            Removed = groupChanges.Removed + endpointChanges.Removed,
            Warnings = new() { "Dry-run mode - no changes applied to database" }
        };
    }

    private async Task<(int Added, int Updated, int Removed)> ApplyChangesToDatabaseAsync(
        List<Group> newGroups, List<Data.Endpoint> newEndpoints)
    {
        List<Group> existingGroups = await _context.Groups.ToListAsync();
        List<Data.Endpoint> existingEndpoints = await _context.Endpoints.ToListAsync();

        (int Added, int Updated, int Removed) groupChanges = UpdateGroups(existingGroups, newGroups);
        (int Added, int Updated, int Removed) endpointChanges = UpdateEndpoints(existingEndpoints, newEndpoints);

        return (
            Added: groupChanges.Added + endpointChanges.Added,
            Updated: groupChanges.Updated + endpointChanges.Updated,
            Removed: groupChanges.Removed + endpointChanges.Removed
        );
    }

    private (int Added, int Updated, int Removed) UpdateGroups(
        List<Group> existing, List<Group> updated)
    {
        int added = 0;
        int updatedCount = 0;
        int removed = 0;

        var existingDict = existing.ToDictionary(g => g.Id);
        var updatedDict = updated.ToDictionary(g => g.Id);

        foreach (Group group in updated)
        {
            if (existingDict.TryGetValue(group.Id, out Group? existingGroup))
            {
                existingGroup.Name = group.Name;
                existingGroup.ParentId = group.ParentId;
                existingGroup.Color = group.Color;
                existingGroup.SortOrder = group.SortOrder;
                updatedCount++;
            }
            else
            {
                _context.Groups.Add(group);
                added++;
            }
        }

        foreach (string existingId in existingDict.Keys)
        {
            if (!updatedDict.ContainsKey(existingId))
            {
                _context.Groups.Remove(existingDict[existingId]);
                removed++;
            }
        }

        return (added, updatedCount, removed);
    }

    private (int Added, int Updated, int Removed) UpdateEndpoints(
        List<Data.Endpoint> existing, List<Data.Endpoint> updated)
    {
        int added = 0;
        int updatedCount = 0;
        int removed = 0;

        var existingByKey = existing.ToDictionary(e => $"{e.Name}|{e.Host}|{e.Port}");
        var updatedByKey = updated.ToDictionary(e => $"{e.Name}|{e.Host}|{e.Port}");

        foreach (Data.Endpoint endpoint in updated)
        {
            string key = $"{endpoint.Name}|{endpoint.Host}|{endpoint.Port}";
            if (existingByKey.TryGetValue(key, out Data.Endpoint? existingEndpoint))
            {
                existingEndpoint.GroupId = endpoint.GroupId;
                existingEndpoint.Type = endpoint.Type;
                existingEndpoint.IntervalSeconds = endpoint.IntervalSeconds;
                existingEndpoint.TimeoutMs = endpoint.TimeoutMs;
                existingEndpoint.Retries = endpoint.Retries;
                existingEndpoint.HttpPath = endpoint.HttpPath;
                existingEndpoint.HttpMatch = endpoint.HttpMatch;
                updatedCount++;
            }
            else
            {
                _context.Endpoints.Add(endpoint);
                added++;
            }
        }

        foreach (string existingKey in existingByKey.Keys)
        {
            if (!updatedByKey.ContainsKey(existingKey))
            {
                _context.Endpoints.Remove(existingByKey[existingKey]);
                removed++;
            }
        }

        return (added, updatedCount, removed);
    }

    private static (int Added, int Updated, int Removed) CalculateGroupChanges(
        List<Group> existing, List<Group> updated)
    {
        int added = 0;
        int updatedCount = 0;
        int removed = 0;

        var existingDict = existing.ToDictionary(g => g.Id);
        var updatedDict = updated.ToDictionary(g => g.Id);

        foreach (Group group in updated)
        {
            if (existingDict.TryGetValue(group.Id, out Group? existingGroup))
            {
                if (existingGroup.Name != group.Name ||
                    existingGroup.ParentId != group.ParentId ||
                    existingGroup.Color != group.Color ||
                    existingGroup.SortOrder != group.SortOrder)
                {
                    updatedCount++;
                }
            }
            else
            {
                added++;
            }
        }

        foreach (string existingId in existingDict.Keys)
        {
            if (!updatedDict.ContainsKey(existingId))
            {
                removed++;
            }
        }

        return (added, updatedCount, removed);
    }

    private static (int Added, int Updated, int Removed) CalculateEndpointChanges(
        List<Data.Endpoint> existing, List<Data.Endpoint> updated)
    {
        int added = 0;
        int updatedCount = 0;
        int removed = 0;

        var existingByKey = existing.ToDictionary(e => $"{e.Name}|{e.Host}|{e.Port}");
        var updatedByKey = updated.ToDictionary(e => $"{e.Name}|{e.Host}|{e.Port}");

        foreach (Data.Endpoint endpoint in updated)
        {
            string key = $"{endpoint.Name}|{endpoint.Host}|{endpoint.Port}";
            if (existingByKey.TryGetValue(key, out Data.Endpoint? existingEndpoint))
            {
                if (existingEndpoint.GroupId != endpoint.GroupId ||
                    existingEndpoint.Type != endpoint.Type ||
                    existingEndpoint.IntervalSeconds != endpoint.IntervalSeconds ||
                    existingEndpoint.TimeoutMs != endpoint.TimeoutMs ||
                    existingEndpoint.Retries != endpoint.Retries ||
                    existingEndpoint.HttpPath != endpoint.HttpPath ||
                    existingEndpoint.HttpMatch != endpoint.HttpMatch)
                {
                    updatedCount++;
                }
            }
            else
            {
                added++;
            }
        }

        foreach (string existingKey in existingByKey.Keys)
        {
            if (!updatedByKey.ContainsKey(existingKey))
            {
                removed++;
            }
        }

        return (added, updatedCount, removed);
    }

    private static string ComputeHash(string content)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(content);
        byte[] hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string GenerateVersionId()
    {
        return UnixTimestamp.FromUnixSeconds(UnixTimestamp.Now()).ToString("yyyyMMddHHmmss") + "-" +
               Guid.NewGuid().ToString("N")[..8];
    }
}
