using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services;

public interface IConfigurationService
{
    Task<ApplyResultDto> ApplyConfigurationAsync(string yamlContent, string? actor = null, string? note = null);
    Task<List<ConfigVersionDto>> GetVersionsAsync();
    Task<string?> GetVersionContentAsync(string versionId);
}

public sealed class ConfigurationService : IConfigurationService
{
    private readonly PulseDbContext _context;
    private readonly ConfigParser _parser;
    private readonly string _versionsPath;

    public ConfigurationService(PulseDbContext context, ConfigParser parser)
    {
        _context = context;
        _parser = parser;
        _versionsPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), 
            "ThingConnect.Pulse", "versions");
    }

    public async Task<ApplyResultDto> ApplyConfigurationAsync(string yamlContent, string? actor = null, string? note = null)
    {
        var (config, validationErrors) = _parser.ParseAndValidate(yamlContent);
        if (validationErrors != null)
        {
            throw new InvalidOperationException($"Validation failed: {validationErrors.Message}");
        }

        var fileHash = ComputeHash(yamlContent);
        var existingVersion = await _context.ConfigVersions
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

        var (groups, endpoints) = _parser.ConvertToEntities(config!);

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var changes = await ApplyChangesToDatabaseAsync(groups, endpoints);

            var versionId = GenerateVersionId();
            var timestamp = DateTimeOffset.UtcNow;
            var fileName = $"{timestamp:yyyyMMdd_HHmmss}_{fileHash[..8]}.yaml";
            var filePath = Path.Combine(_versionsPath, fileName);

            Directory.CreateDirectory(_versionsPath);
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

    public async Task<List<ConfigVersionDto>> GetVersionsAsync()
    {
        var versions = await _context.ConfigVersions
            .Select(cv => new ConfigVersionDto
            {
                Id = cv.Id,
                AppliedTs = cv.AppliedTs,
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
        var version = await _context.ConfigVersions
            .FirstOrDefaultAsync(cv => cv.Id == versionId);

        if (version == null || !File.Exists(version.FilePath))
        {
            return null;
        }

        return await File.ReadAllTextAsync(version.FilePath);
    }

    private async Task<(int Added, int Updated, int Removed)> ApplyChangesToDatabaseAsync(
        List<Group> newGroups, List<Data.Endpoint> newEndpoints)
    {
        var existingGroups = await _context.Groups.ToListAsync();
        var existingEndpoints = await _context.Endpoints.ToListAsync();

        var groupChanges = UpdateGroups(existingGroups, newGroups);
        var endpointChanges = UpdateEndpoints(existingEndpoints, newEndpoints);

        return (
            Added: groupChanges.Added + endpointChanges.Added,
            Updated: groupChanges.Updated + endpointChanges.Updated,
            Removed: groupChanges.Removed + endpointChanges.Removed
        );
    }

    private (int Added, int Updated, int Removed) UpdateGroups(
        List<Group> existing, List<Group> updated)
    {
        var added = 0;
        var updatedCount = 0;
        var removed = 0;

        var existingDict = existing.ToDictionary(g => g.Id);
        var updatedDict = updated.ToDictionary(g => g.Id);

        foreach (var group in updated)
        {
            if (existingDict.TryGetValue(group.Id, out var existingGroup))
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

        foreach (var existingId in existingDict.Keys)
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
        var added = 0;
        var updatedCount = 0;
        var removed = 0;

        var existingByKey = existing.ToDictionary(e => $"{e.Name}|{e.Host}|{e.Port}");
        var updatedByKey = updated.ToDictionary(e => $"{e.Name}|{e.Host}|{e.Port}");

        foreach (var endpoint in updated)
        {
            var key = $"{endpoint.Name}|{endpoint.Host}|{endpoint.Port}";
            if (existingByKey.TryGetValue(key, out var existingEndpoint))
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

        foreach (var existingKey in existingByKey.Keys)
        {
            if (!updatedByKey.ContainsKey(existingKey))
            {
                _context.Endpoints.Remove(existingByKey[existingKey]);
                removed++;
            }
        }

        return (added, updatedCount, removed);
    }

    private static string ComputeHash(string content)
    {
        var bytes = Encoding.UTF8.GetBytes(content);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string GenerateVersionId()
    {
        return DateTimeOffset.UtcNow.ToString("yyyyMMddHHmmss") + "-" + 
               Guid.NewGuid().ToString("N")[..8];
    }
}