using System.Runtime.Versioning;
#if NET8_0_OR_GREATER && WINDOWS
using System.Security.AccessControl;
using System.Security.Principal;
#endif

namespace ThingConnect.Pulse.Server.Services;

public interface IPathService
{
    string GetRootDirectory();
    string GetConfigDirectory();
    string GetConfigFilePath();
    string GetVersionsDirectory();
    string GetLogsDirectory();
    string GetDataDirectory();
    string GetDatabaseFilePath();
    Task EnsureDirectoriesExistAsync();
}

public sealed class PathService : IPathService
{
    private readonly string _rootDirectory;

    public PathService()
    {
        _rootDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
            "ThingConnect.Pulse");
    }

    public string GetRootDirectory() => _rootDirectory;

    public string GetConfigDirectory() => Path.Combine(_rootDirectory, "config");

    public string GetConfigFilePath() => Path.Combine(GetConfigDirectory(), "config.yaml");

    public string GetVersionsDirectory() => Path.Combine(_rootDirectory, "versions");

    public string GetLogsDirectory() => Path.Combine(_rootDirectory, "logs");

    public string GetDataDirectory() => Path.Combine(_rootDirectory, "data");

    public string GetDatabaseFilePath() => Path.Combine(GetDataDirectory(), "pulse.db");

    public async Task EnsureDirectoriesExistAsync()
    {
        string[] directories = new[]
        {
            GetRootDirectory(),
            GetConfigDirectory(),
            GetVersionsDirectory(),
            GetLogsDirectory(),
            GetDataDirectory()
        };

        foreach (string directory in directories)
        {
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);

                // Set proper permissions for the service account (Windows only)
                if (OperatingSystem.IsWindows())
                {
                    SetDirectoryPermissions(directory);
                }
            }
        }

        // Create default config file if it doesn't exist
        string configFile = GetConfigFilePath();
        if (!File.Exists(configFile))
        {
            await CreateDefaultConfigFileAsync(configFile);
        }
    }

    [SupportedOSPlatform("windows")]
    private static void SetDirectoryPermissions(string directory)
    {
#if NET8_0_OR_GREATER && WINDOWS
        try
        {
            var directoryInfo = new DirectoryInfo(directory);
            DirectorySecurity security = directoryInfo.GetAccessControl();

            // Grant full control to SYSTEM account
            var systemAccount = new SecurityIdentifier(WellKnownSidType.LocalSystemSid, null);
            var systemRule = new FileSystemAccessRule(
                systemAccount,
                FileSystemRights.FullControl,
                InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit,
                PropagationFlags.None,
                AccessControlType.Allow);

            // Grant read/modify to Administrators
            var adminAccount = new SecurityIdentifier(WellKnownSidType.BuiltinAdministratorsSid, null);
            var adminRule = new FileSystemAccessRule(
                adminAccount,
                FileSystemRights.Modify,
                InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit,
                PropagationFlags.None,
                AccessControlType.Allow);

            security.SetAccessRule(systemRule);
            security.SetAccessRule(adminRule);
            
            directoryInfo.SetAccessControl(security);
        }
        catch (Exception ex)
        {
            // Log warning but don't fail startup - permissions might work anyway
            Console.WriteLine($"Warning: Could not set directory permissions for {directory}: {ex.Message}");
        }
#endif
    }

    private static async Task CreateDefaultConfigFileAsync(string configFile)
    {
        const string defaultConfig = """
            # ThingConnect Pulse Configuration
            # This is the main configuration file for network monitoring
            # 
            # For configuration syntax and examples, see:
            # https://github.com/MachDatum/ThingConnect.Pulse/blob/main/docs/config.schema.json

            # Example configuration:
            # targets:
            #   - name: "Router"
            #     endpoints:
            #       - host: "192.168.1.1"
            #         type: "icmp"
            #   - name: "Web Services" 
            #     endpoints:
            #       - host: "www.example.com"
            #         type: "http"
            #         path: "/health"

            # Empty configuration - add your monitoring targets above
            targets: []
            """;

        await File.WriteAllTextAsync(configFile, defaultConfig);
    }
}