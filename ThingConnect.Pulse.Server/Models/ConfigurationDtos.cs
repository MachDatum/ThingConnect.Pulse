namespace ThingConnect.Pulse.Server.Models;

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
    public int IntervalSeconds { get; set; } = 10;
    public int TimeoutMs { get; set; } = 1500;
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
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? ParentId { get; set; }
    public string? Color { get; set; }
    public int? SortOrder { get; set; }
}

public sealed class TargetSection
{
    public string Name { get; set; } = default!;
    public string Host { get; set; } = default!;
    public int? Port { get; set; }
    public string? Group { get; set; }
    public string? Type { get; set; }
    public int? IntervalSeconds { get; set; }
    public int? TimeoutMs { get; set; }
    public int? Retries { get; set; }
    public string? Path { get; set; }
    public string? ExpectText { get; set; }
    public string? UserAgent { get; set; }
}
