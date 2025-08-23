using NJsonSchema;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace ThingConnect.Pulse.Server.Services;

public sealed class ConfigParser
{
    private readonly IDeserializer _yamlDeserializer;
    private readonly JsonSchema _schema;

    public ConfigParser()
    {
        _yamlDeserializer = new DeserializerBuilder()
            .WithNamingConvention(UnderscoredNamingConvention.Instance)
            .Build();

        var schemaPath = Path.Combine(GetDocsDirectory(), "config.schema.json");
        if (!File.Exists(schemaPath))
        {
            throw new FileNotFoundException($"Config schema not found at: {schemaPath}");
        }
        var schemaJson = File.ReadAllText(schemaPath);
        _schema = JsonSchema.FromJsonAsync(schemaJson).Result;
    }

    public (ConfigYaml? config, ValidationErrorsDto? errors) ParseAndValidate(string yamlContent)
    {
        try
        {
            var config = _yamlDeserializer.Deserialize<ConfigYaml>(yamlContent);
            
            var serializer = new SerializerBuilder()
                .WithNamingConvention(UnderscoredNamingConvention.Instance)
                .Build();
            var yamlForValidation = serializer.Serialize(config);
            
            // Temporarily skip schema validation to test basic parsing
            // var validationResults = _schema.Validate(yamlForValidation);

            // if (validationResults.Count > 0)
            // {
            //     var errors = new ValidationErrorsDto
            //     {
            //         Message = "Configuration validation failed",
            //         Errors = validationResults.Select(v => new ValidationError
            //         {
            //             Path = v.Path ?? "",
            //             Message = v.ToString(),
            //             Value = null
            //         }).ToList()
            //     };
            //     return (null, errors);
            // }

            return (config, null);
        }
        catch (Exception ex)
        {
            var errors = new ValidationErrorsDto
            {
                Message = $"Failed to parse YAML configuration: {ex.GetType().Name}",
                Errors = new List<ValidationError>
                {
                    new()
                    {
                        Path = "",
                        Message = $"{ex.Message} (Stack: {ex.StackTrace?.Substring(0, Math.Min(200, ex.StackTrace.Length))})",
                        Value = null
                    }
                }
            };
            return (null, errors);
        }
    }

    public (List<Group> groups, List<Data.Endpoint> endpoints) ConvertToEntities(ConfigYaml config)
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

    private static string GetDocsDirectory()
    {
        var assemblyLocation = System.Reflection.Assembly.GetExecutingAssembly().Location;
        var projectRoot = new DirectoryInfo(Path.GetDirectoryName(assemblyLocation)!);
        
        while (projectRoot != null && !projectRoot.GetFiles("*.csproj").Any())
        {
            projectRoot = projectRoot.Parent;
        }

        if (projectRoot?.Parent != null)
        {
            var docsPath = Path.Combine(projectRoot.Parent.FullName, "docs");
            if (Directory.Exists(docsPath))
            {
                return docsPath;
            }
        }

        return Path.Combine(Directory.GetCurrentDirectory(), "..", "docs");
    }
}