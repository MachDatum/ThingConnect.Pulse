using NJsonSchema;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services.Monitoring;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace ThingConnect.Pulse.Server.Services;

public sealed class ConfigurationParser
{
    private readonly IDeserializer _yamlDeserializer;
    private readonly JsonSchema _schema;
    private readonly ILogger<ConfigurationParser> _logger;
    private readonly IDiscoveryService _discoveryService;

    private ConfigurationParser(JsonSchema schema, ILogger<ConfigurationParser> logger, IDiscoveryService discoveryService)
    {
        _yamlDeserializer = new DeserializerBuilder()
            .WithNamingConvention(UnderscoredNamingConvention.Instance)
            .Build();
        _schema = schema;
        _logger = logger;
        _discoveryService = discoveryService;
    }

    public static async Task<ConfigurationParser> CreateAsync(ILogger<ConfigurationParser> logger, IDiscoveryService discoveryService)
    {
        // Try multiple methods to determine the assembly directory
        string? assemblyDirectory = null;

        // Method 1: Try GetExecutingAssembly().Location
        string assemblyLocation = System.Reflection.Assembly.GetExecutingAssembly().Location;
        if (!string.IsNullOrEmpty(assemblyLocation))
        {
            assemblyDirectory = Path.GetDirectoryName(assemblyLocation);
        }

        // Method 2: Try AppContext.BaseDirectory if Location failed
        if (string.IsNullOrEmpty(assemblyDirectory))
        {
            assemblyDirectory = AppContext.BaseDirectory;
            logger.LogDebug("Using AppContext.BaseDirectory: {BaseDirectory}", assemblyDirectory);
        }

        // Method 3: Try current directory as fallback
        if (string.IsNullOrEmpty(assemblyDirectory))
        {
            assemblyDirectory = Environment.CurrentDirectory;
            logger.LogDebug("Using current directory: {CurrentDirectory}", assemblyDirectory);
        }

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
        return new ConfigurationParser(schema, logger, discoveryService);
    }

    public Task<(ConfigurationYaml? Configuration, ValidationErrorsDto? Errors)> ParseAndValidateAsync(string yamlContent)
    {
        try
        {
            _logger.LogDebug("Starting YAML configuration parsing and validation");

            // First, deserialize the YAML
            ConfigurationYaml config = _yamlDeserializer.Deserialize<ConfigurationYaml>(yamlContent);
            var ipv6Errors = new List<ValidationError>();

            foreach (var target in config.Targets)
            {
                if (!string.IsNullOrEmpty(target.Cidr) && target.Cidr.Contains(":"))
                {
                    string[] parts = target.Cidr.Split('/');
                    if (parts.Length != 2 || !int.TryParse(parts[1], out int prefix))
                    {
                        ipv6Errors.Add(new ValidationError
                        {
                            Path = "cidr",
                            Message = $"Invalid IPv6 CIDR format: {target.Cidr}",
                            Value = target.Cidr
                        });
                        continue;
                    }

                    if (prefix < 120 || prefix > 128)
                    {
                        ipv6Errors.Add(new ValidationError
                        {
                            Path = "cidr",
                            Message = $"IPv6 prefix /{prefix} too large to expand practically (supported: /120–/128)",
                            Value = target.Cidr
                        });
                    }
                }
            }

            if (ipv6Errors.Any())
            {
                return Task.FromResult<(ConfigurationYaml?, ValidationErrorsDto?)>(
                    (null,
                    new ValidationErrorsDto
                    {
                        Message = "IPv6 expansion validation failed",
                        Errors = ipv6Errors
                    }));
            }

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
                    _logger.LogWarning("Validation error at {Path}: {Message}", validationResult.Path ?? string.Empty, validationResult.ToString());
                }

                var errors = new ValidationErrorsDto
                {
                    Message = "Configuration validation failed",
                    Errors = validationResults.Select(v => new ValidationError
                    {
                        Path = v.Path ?? string.Empty,
                        Message = v.ToString(),
                        Value = null
                    }).ToList()
                };
                return Task.FromResult<(ConfigurationYaml? Configuration, ValidationErrorsDto? Errors)>((null, errors));
            }

            _logger.LogInformation("Configuration parsed and validated successfully with {GroupCount} groups and {TargetCount} targets",
                config.Groups.Count, config.Targets.Count);
            return Task.FromResult<(ConfigurationYaml? Configuration, ValidationErrorsDto? Errors)>((config, null));
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
                        Path = string.Empty,
                        Message = yamlEx.Message,
                        Value = null,
                        Line = (int?)yamlEx.Start.Line,
                        Column = (int?)yamlEx.Start.Column
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
                        Path = string.Empty,
                        Message = ex.Message,
                        Value = null
                    }
                }
            };
            return Task.FromResult<(ConfigurationYaml? Configuration, ValidationErrorsDto? Errors)>((null, errors));
        }
    }

    public async Task<(List<Group> Groups, List<Data.Endpoint> Endpoints)> ConvertToEntitiesAsync(ConfigurationYaml config)
    {
        var groups = config.Groups.Select(g => new Group
        {
            Id = g.Id,
            Name = g.Name,
            ParentId = g.ParentId,
            Color = g.Color,
            SortOrder = g.SortOrder ?? 0
        }).ToList();

        // Convert config targets to dynamic objects for DiscoveryService
        var dynamicTargets = config.Targets.Select(t => new
        {
            type = t.Type.ToString().ToLower(),
            host = t.Host,
            cidr = t.Cidr,
            wildcard = t.Wildcard,
            port = t.Port,
            name = t.Name,
            group = t.Group,
            interval_seconds = t.IntervalSeconds ?? config.Defaults.IntervalSeconds,
            timeout_ms = t.TimeoutMs ?? config.Defaults.TimeoutMs,
            retries = t.Retries ?? config.Defaults.Retries,
            path = t.HttpPath,
            expect_text = t.HttpMatch ?? config.Defaults.Http?.ExpectText,
            enabled = t.Enabled ?? true,
            notes = t.Notes,
            expected_rtt_ms = t.ExpectedRttMs
        }).Cast<dynamic>().ToList();

        // Use DiscoveryService to expand CIDR ranges, wildcards, and hostnames
        IEnumerable<Data.Endpoint> expandedEndpoints = await _discoveryService.ExpandTargetsAsync(dynamicTargets);
        var endpoints = expandedEndpoints.ToList();

        _logger.LogInformation("Converted configuration with {GroupCount} groups and {TargetCount} targets into {EndpointCount} endpoints",
            groups.Count, config.Targets.Count, endpoints.Count);

        return (groups, endpoints);
    }
}
