using NJsonSchema;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace ThingConnect.Pulse.Server.Services;

public sealed class ConfigurationParser
{
    private readonly IDeserializer _yamlDeserializer;
    private readonly JsonSchema _schema;
    private readonly ILogger<ConfigurationParser> _logger;

    private ConfigurationParser(JsonSchema schema, ILogger<ConfigurationParser> logger)
    {
        _yamlDeserializer = new DeserializerBuilder()
            .WithNamingConvention(UnderscoredNamingConvention.Instance)
            .Build();
        _schema = schema;
        _logger = logger;
    }

    public static async Task<ConfigurationParser> CreateAsync(ILogger<ConfigurationParser> logger)
    {
        string assemblyLocation = System.Reflection.Assembly.GetExecutingAssembly().Location;
        string? assemblyDirectory = Path.GetDirectoryName(assemblyLocation);

        if (string.IsNullOrEmpty(assemblyDirectory))
        {
            logger.LogWarning("Unable to determine assembly directory from location: {AssemblyLocation}", assemblyLocation);
            throw new InvalidOperationException("Unable to determine assembly directory");
        }

        string schemaPath = Path.Combine(assemblyDirectory, "config.schema.json");
        if (!File.Exists(schemaPath))
        {
            logger.LogWarning("Config schema file not found at expected path: {SchemaPath}", schemaPath);
            throw new FileNotFoundException($"Config schema not found at: {schemaPath}");
        }

        logger.LogDebug("Loading config schema from: {SchemaPath}", schemaPath);
        string schemaJson = await File.ReadAllTextAsync(schemaPath);
        JsonSchema schema = await JsonSchema.FromJsonAsync(schemaJson);
        logger.LogInformation("Configuration schema loaded successfully");
        return new ConfigurationParser(schema, logger);
    }

    public Task<(ConfigurationYaml? Configuration, ValidationErrorsDto? Errors)> ParseAndValidateAsync(string yamlContent)
    {
        try
        {
            _logger.LogDebug("Starting YAML configuration parsing and validation");

            // First, deserialize the YAML
            ConfigurationYaml config = _yamlDeserializer.Deserialize<ConfigurationYaml>(yamlContent);

            // Convert back to JSON for schema validation
            ISerializer serializer = new SerializerBuilder()
                .WithNamingConvention(UnderscoredNamingConvention.Instance)
                .JsonCompatible()
                .Build();
            string configJson = serializer.Serialize(config);

            // Perform schema validation
            ICollection<NJsonSchema.Validation.ValidationError> validationResults = _schema.Validate(configJson);

            if (validationResults.Count > 0)
            {
                _logger.LogWarning("Configuration validation failed with {ErrorCount} errors", validationResults.Count);
                foreach (NJsonSchema.Validation.ValidationError validationResult in validationResults)
                {
                    _logger.LogWarning("Validation error at {Path}: {Message}", validationResult.Path ?? "", validationResult.ToString());
                }

                var errors = new ValidationErrorsDto
                {
                    Message = "Configuration validation failed",
                    Errors = validationResults.Select(v => new ValidationError
                    {
                        Path = v.Path ?? "",
                        Message = v.ToString(),
                        Value = null
                    }).ToList()
                };
                return Task.FromResult<(ConfigurationYaml? config, ValidationErrorsDto? errors)>((null, errors));
            }

            _logger.LogInformation("Configuration parsed and validated successfully with {GroupCount} groups and {TargetCount} targets",
                config.Groups.Count, config.Targets.Count);
            return Task.FromResult<(ConfigurationYaml? config, ValidationErrorsDto? errors)>((config, null));
        }
        catch (YamlDotNet.Core.YamlException yamlEx)
        {
            _logger.LogWarning(yamlEx, "YAML parsing failed at line {Line}, column {Column}: {Message}",
                yamlEx.Start.Line, yamlEx.Start.Column, yamlEx.Message);

            var errors = new ValidationErrorsDto
            {
                Message = "Invalid YAML format",
                Errors = new List<ValidationError>
                {
                    new()
                    {
                        Path = $"Line {yamlEx.Start.Line}, Column {yamlEx.Start.Column}",
                        Message = yamlEx.Message,
                        Value = null
                    }
                }
            };
            return Task.FromResult<(ConfigurationYaml? config, ValidationErrorsDto? errors)>((null, errors));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Configuration parsing failed with {ExceptionType}: {Message}",
                ex.GetType().Name, ex.Message);

            var errors = new ValidationErrorsDto
            {
                Message = $"Failed to parse configuration: {ex.GetType().Name}",
                Errors = new List<ValidationError>
                {
                    new()
                    {
                        Path = "",
                        Message = ex.Message,
                        Value = null
                    }
                }
            };
            return Task.FromResult<(ConfigurationYaml? Configuration, ValidationErrorsDto? Errors)>((null, errors));
        }
    }

    public (List<Group> Groups, List<Data.Endpoint> Endpoints) ConvertToEntities(ConfigurationYaml config)
    {
        var groups = config.Groups.Select(g => new Group
        {
            Id = g.Id,
            Name = g.Name,
            ParentId = g.ParentId,
            Color = g.Color,
            SortOrder = g.SortOrder ?? 0
        }).ToList();

        var endpoints = config.Targets.Select(t => new Data.Endpoint
        {
            Id = Guid.NewGuid(),
            Name = t.Name,
            GroupId = t.Group ?? "default",
            Type = ParseProbeType(t.Type ?? "icmp"),
            Host = t.Host,
            Port = t.Port,
            IntervalSeconds = t.IntervalSeconds ?? config.Defaults.IntervalSeconds,
            TimeoutMs = t.TimeoutMs ?? config.Defaults.TimeoutMs,
            Retries = t.Retries ?? config.Defaults.Retries,
            HttpPath = t.Path,
            HttpMatch = t.ExpectText ?? config.Defaults.Http?.ExpectText
        }).ToList();

        return (groups, endpoints);
    }

    private static ProbeType ParseProbeType(string type) => type.ToLowerInvariant() switch
    {
        "icmp" => ProbeType.icmp,
        "tcp" => ProbeType.tcp,
        "http" => ProbeType.http,
        "https" => ProbeType.http,
        _ => ProbeType.icmp
    };
}
