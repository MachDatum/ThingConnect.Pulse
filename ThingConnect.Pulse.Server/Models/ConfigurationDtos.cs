using System.ComponentModel.DataAnnotations;
using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Models;

public class ConfigurationValidationException : Exception
{
    public ValidationErrorsDto ValidationErrors { get; }

    public ConfigurationValidationException(ValidationErrorsDto validationErrors)
        : base(validationErrors.Message)
    {
        ValidationErrors = validationErrors;
    }
}

public sealed class ConfigurationVersionDto
{
    public string Id { get; set; } = default!;
    public DateTimeOffset AppliedTs { get; set; }
    public string FileHash { get; set; } = default!;
    public string FilePath { get; set; } = default!;
    public string? Actor { get; set; }
    public string? Note { get; set; }
}

public sealed class ApplyResultDto
{
    public string ConfigVersionId { get; set; } = default!;
    public int Added { get; set; }
    public int Updated { get; set; }
    public int Removed { get; set; }
    public List<string> Warnings { get; set; } = new();
}

public sealed class ValidationErrorsDto
{
    public string Message { get; set; } = default!;
    public List<ValidationError> Errors { get; set; } = new();
}

public sealed class ValidationError
{
    public string Path { get; set; } = default!;
    public string Message { get; set; } = default!;
    public object? Value { get; set; }
    public int? Line { get; set; }
    public int? Column { get; set; }
}

public sealed class ConfigurationYaml
{
    public int Version { get; set; } = 1;
    public DefaultsSection Defaults { get; set; } = default!;
    public List<GroupSection> Groups { get; set; } = new();
    public List<TargetSection> Targets { get; set; } = new();
}

public sealed class DefaultsSection
{
    [Required]
    [Range(1, int.MaxValue)]
    public int IntervalSeconds { get; set; } = 10;

    [Required]
    [Range(100, int.MaxValue)]
    public int TimeoutMs { get; set; } = 1500;

    [Required]
    [Range(0, int.MaxValue)]
    public int Retries { get; set; } = 1;

    public HttpSection? Http { get; set; }
}

public sealed class HttpSection
{
    public string UserAgent { get; set; } = "ThingConnectPulse/1.0";
    public string ExpectText { get; set; } = "";
}

public sealed class GroupSection
{
    [Required]
    [RegularExpression("^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$", ErrorMessage = "ID must be lowercase alphanumeric with hyphens, 3-64 characters")]
    public string Id { get; set; } = default!;

    [Required]
    [MinLength(1)]
    public string Name { get; set; } = default!;

    public string? ParentId { get; set; }

    [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Color must be a valid hex color code")]
    public string? Color { get; set; }

    public int? SortOrder { get; set; }
}

public sealed class TargetSection
{
    public string? Name { get; set; }

    // Location properties (oneOf: host, cidr, wildcard)
    public string? Host { get; set; }
    public string? Cidr { get; set; }
    public string? Wildcard { get; set; }

    // Required properties
    [Required]
    public ProbeType Type { get; set; }

    [Required]
    public string Group { get; set; } = default!;

    // Optional timing properties
    [Range(1, int.MaxValue)]
    public int? IntervalSeconds { get; set; }

    [Range(100, int.MaxValue)]
    public int? TimeoutMs { get; set; }

    [Range(0, int.MaxValue)]
    public int? Retries { get; set; }

    [Range(1, int.MaxValue)]
    public int? ExpectedRttMs { get; set; }

    // TCP/HTTP properties
    [Range(1, 65535)]
    public int? Port { get; set; }

    // HTTP-specific properties (renamed from Path to HttpPath)
    public string? HttpPath { get; set; } = "/";
    public string? HttpMatch { get; set; }
    public string? UserAgent { get; set; }

    // Additional properties
    public bool? Enabled { get; set; } = true;
    public string? Notes { get; set; }
}
