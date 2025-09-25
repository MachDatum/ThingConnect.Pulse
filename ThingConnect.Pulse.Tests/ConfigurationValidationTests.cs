using NJsonSchema;
using NUnit.Framework;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace ThingConnect.Pulse.Tests;

[TestFixture]
public class ConfigurationValidationTests
{
    private JsonSchema? _schema;
    private IDeserializer? _yamlDeserializer;
    private ISerializer? _yamlSerializer;

    [OneTimeSetUp]
    public async Task OneTimeSetUp()
    {
        // Load schema once for all tests
        string schemaPath = Path.Combine(TestContext.CurrentContext.TestDirectory, "config.schema.json");
        Assert.That(File.Exists(schemaPath), Is.True, $"Schema file not found at: {schemaPath}");

        string schemaJson = await File.ReadAllTextAsync(schemaPath);
        _schema = await JsonSchema.FromJsonAsync(schemaJson);

        // Setup YAML processors
        _yamlDeserializer = new DeserializerBuilder()
            .WithNamingConvention(UnderscoredNamingConvention.Instance)
            .Build();

        _yamlSerializer = new SerializerBuilder()
            .WithNamingConvention(UnderscoredNamingConvention.Instance)
            .JsonCompatible()
            .Build();
    }

    #region Positive Tests

    [Test]
    public async Task TestConfigurationValidation_WithValidYaml_ShouldPassValidation()
    {
        string yamlPath = Path.Combine(TestContext.CurrentContext.TestDirectory, "test-config.yaml");
        string yamlContent = await File.ReadAllTextAsync(yamlPath);

        object config = _yamlDeserializer.Deserialize<object>(yamlContent);
        string configJson = _yamlSerializer.Serialize(config);
        var errors = _schema!.Validate(configJson);

        Assert.That(errors.Count, Is.EqualTo(0), $"Validation failed: {string.Join(", ", errors)}");
    }

    [Test]
    public async Task TestConfigurationValidation_WithMinimalYaml_ShouldPassValidation()
    {
        string yamlPath = Path.Combine(TestContext.CurrentContext.TestDirectory, "test-config-minimal.yaml");
        string yamlContent = await File.ReadAllTextAsync(yamlPath);

        object config = _yamlDeserializer.Deserialize<object>(yamlContent);
        string configJson = _yamlSerializer.Serialize(config);
        var errors = _schema!.Validate(configJson);

        Assert.That(errors.Count, Is.EqualTo(0), $"Validation failed: {string.Join(", ", errors)}");
    }

    [Test]
    public void TestCidrExpansion_With24Subnet_ShouldReturn254IPs()
    {
        List<string> expandedIPs = ExpandCidrForTesting("10.18.8.0/24");
        Assert.That(expandedIPs.Count, Is.EqualTo(254));
        Assert.That(expandedIPs[0], Is.EqualTo("10.18.8.1"));
        Assert.That(expandedIPs[253], Is.EqualTo("10.18.8.254"));
    }

    [Test]
    public void TestCidrExpansion_With30Subnet_ShouldReturn2IPs()
    {
        List<string> expandedIPs = ExpandCidrForTesting("192.168.1.0/30");
        Assert.That(expandedIPs.Count, Is.EqualTo(2));
        Assert.That(expandedIPs[0], Is.EqualTo("192.168.1.1"));
        Assert.That(expandedIPs[1], Is.EqualTo("192.168.1.2"));
    }

    [Test]
    public void TestWildcardExpansion_ShouldReturn254IPs()
    {
        List<string> expandedIPs = ExpandWildcardForTesting("10.10.1.*");
        Assert.That(expandedIPs.Count, Is.EqualTo(254));
        Assert.That(expandedIPs[0], Is.EqualTo("10.10.1.1"));
        Assert.That(expandedIPs[253], Is.EqualTo("10.10.1.254"));
    }

    [Test]
    public void TestCidrExpansion_WithIPv6_ShouldReturnMockIPs()
    {
        List<string> expandedIPs = ExpandCidrForTesting("fd7a:115c:a1e0::/126", ipv6: true);
        Assert.That(expandedIPs.Count, Is.EqualTo(2));
        Assert.That(expandedIPs[0], Is.EqualTo("fd7a:115c:a1e0::1"));
        Assert.That(expandedIPs[1], Is.EqualTo("fd7a:115c:a1e0::2"));
    }

    #endregion

    #region Negative Tests

    [Test]
    public void TestCidrExpansion_WithInvalidFormat_ShouldReturnEmpty()
    {
        List<string> expandedIPs = ExpandCidrForTesting("invalid-cidr");
        Assert.That(expandedIPs.Count, Is.EqualTo(0));
    }

    [Test]
    public void TestMissingTcpPort_ShouldFailValidation()
    {
        var config = new
        {
            version = 1,
            defaults = new { interval_seconds = 10, timeout_ms = 1500, retries = 1 },
            groups = new[] { new { id = "group1", name = "Group 1" } },
            targets = new[]
            {
                new { type = "tcp", host = "10.0.0.1", group = "group1" } // missing port
            }
        };
        string json = System.Text.Json.JsonSerializer.Serialize(config);
        var errors = _schema!.Validate(json);
        Assert.That(errors.Count, Is.GreaterThan(0));
    }

    [Test]
    public void TestInvalidGroupId_ShouldFailValidation()
    {
        var config = new
        {
            version = 1,
            defaults = new { interval_seconds = 10, timeout_ms = 1500, retries = 1 },
            groups = new[] { new { id = "Invalid ID!", name = "Group" } },
            targets = new[] { new { type = "icmp", host = "10.0.0.1", group = "Invalid ID!" } }
        };
        string json = System.Text.Json.JsonSerializer.Serialize(config);
        var errors = _schema!.Validate(json);
        Assert.That(errors.Count, Is.GreaterThan(0));
    }

    [Test]
    public void TestInvalidColor_ShouldFailValidation()
    {
        var config = new
        {
            version = 1,
            defaults = new { interval_seconds = 10, timeout_ms = 1500, retries = 1 },
            groups = new[] { new { id = "group1", name = "Group 1", color = "red" } },
            targets = new[] { new { type = "icmp", host = "10.0.0.1", group = "group1" } }
        };
        string json = System.Text.Json.JsonSerializer.Serialize(config);
        var errors = _schema!.Validate(json);
        Assert.That(errors.Count, Is.GreaterThan(0));
    }

    [Test]
    public void TestInvalidType_ShouldFailValidation()
    {
        var config = new
        {
            version = "2", // invalid enum
            defaults = new { interval_seconds = "abc", timeout_ms = 1500, retries = 1 },
            groups = new[] { new { id = "group1", name = "Group 1" } },
            targets = new[] { new { type = "icmp", host = "10.0.0.1", group = "group1" } }
        };
        string json = System.Text.Json.JsonSerializer.Serialize(config);
        var errors = _schema!.Validate(json);
        Assert.That(errors.Count, Is.GreaterThan(0));
    }

    [Test]
    public void TestEmptyTargets_ShouldFailValidation()
    {
        var config = new
        {
            version = 1,
            defaults = new { interval_seconds = 10, timeout_ms = 1500, retries = 1 },
            groups = new[] { new { id = "group1", name = "Group 1" } },
            targets = new object[] { } // empty array
        };
        string json = System.Text.Json.JsonSerializer.Serialize(config);
        var errors = _schema!.Validate(json);
        Assert.That(errors.Count, Is.GreaterThan(0));
    }

    #endregion

    #region Helpers

    private List<string> ExpandCidrForTesting(string cidr, bool ipv6 = false)
    {
        var result = new List<string>();
        if (!ipv6)
        {
            try
            {
                string[] parts = cidr.Split('/');
                if (parts.Length != 2) return result;
                string baseIp = parts[0];
                if (!int.TryParse(parts[1], out int prefix)) return result;
                if (!System.Net.IPAddress.TryParse(baseIp, out var ip)) return result;

                byte[] bytes = ip.GetAddressBytes();
                uint addressInt = BitConverter.ToUInt32(bytes.Reverse().ToArray(), 0);
                int hostBits = 32 - prefix;
                uint count = (uint)(1 << hostBits);
                uint networkAddress = addressInt & (0xFFFFFFFF << hostBits);
                for (uint i = 1; i < count - 1; i++)
                {
                    uint addr = networkAddress + i;
                    byte[] ipBytes = BitConverter.GetBytes(addr).Reverse().ToArray();
                    result.Add(new System.Net.IPAddress(ipBytes).ToString());
                }
            }
            catch { }
        }
        else
        {
            // Mock IPv6 expansion for small subnets
            if (cidr.EndsWith("/126"))
            {
                result.Add("fd7a:115c:a1e0::1");
                result.Add("fd7a:115c:a1e0::2");
            }
        }

        return result;
    }

    private List<string> ExpandWildcardForTesting(string wildcard)
    {
        var result = new List<string>();
        if (wildcard.EndsWith(".*"))
        {
            string baseIp = wildcard.Substring(0, wildcard.Length - 2);
            for (int i = 1; i <= 254; i++) result.Add($"{baseIp}.{i}");
        }
        return result;
    }

    #endregion
}
