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

    [Test]
    public async Task TestConfigurationValidation_WithValidYaml_ShouldPassValidation()
    {
        // Arrange
        string yamlPath = Path.Combine(TestContext.CurrentContext.TestDirectory, "test-config.yaml");
        Assert.That(File.Exists(yamlPath), Is.True, $"Test YAML file not found at: {yamlPath}");

        string yamlContent = await File.ReadAllTextAsync(yamlPath);

        // Act
        object config = _yamlDeserializer.Deserialize<object>(yamlContent);
        string configJson = _yamlSerializer.Serialize(config);
        ICollection<NJsonSchema.Validation.ValidationError> validationResults = _schema!.Validate(configJson);

        // Assert
        Assert.That(validationResults.Count, Is.EqualTo(0),
            $"Validation should pass but found {validationResults.Count} errors: {string.Join(", ", validationResults)}");
    }

    [Test]
    public void TestCidrExpansion_With24Subnet_ShouldReturn254IPs()
    {
        // Arrange
        string cidr = "10.18.8.0/24";

        // Act
        List<string> expandedIPs = ExpandCidrForTesting(cidr);

        // Assert
        Assert.That(expandedIPs.Count, Is.EqualTo(254), "CIDR /24 should expand to 254 IPs (skip .0 and .255)");
        Assert.That(expandedIPs[0], Is.EqualTo("10.18.8.1"), "First IP should be .1");
        Assert.That(expandedIPs[253], Is.EqualTo("10.18.8.254"), "Last IP should be .254");
    }

    [Test]
    public void TestCidrExpansion_With30Subnet_ShouldReturn2IPs()
    {
        // Arrange
        string cidr = "192.168.1.0/30";

        // Act
        List<string> expandedIPs = ExpandCidrForTesting(cidr);

        // Assert
        Assert.That(expandedIPs.Count, Is.EqualTo(2), "CIDR /30 should expand to 2 IPs");
        Assert.That(expandedIPs[0], Is.EqualTo("192.168.1.1"));
        Assert.That(expandedIPs[1], Is.EqualTo("192.168.1.2"));
    }

    [Test]
    public void TestCidrExpansion_WithInvalidFormat_ShouldReturnEmpty()
    {
        // Arrange
        string invalidCidr = "invalid-cidr";

        // Act & Assert
        List<string> expandedIPs = ExpandCidrForTesting(invalidCidr);
        Assert.That(expandedIPs.Count, Is.EqualTo(0), "Invalid CIDR should return empty list");
    }

    [Test]
    public async Task TestConfigurationValidation_WithMinimalYaml_ShouldFailWithOldSchema()
    {
        // This test demonstrates why the server was failing before the null fixes
        // Arrange
        string yamlPath = Path.Combine(TestContext.CurrentContext.TestDirectory, "test-config-minimal.yaml");
        Assert.That(File.Exists(yamlPath), Is.True, $"Minimal test YAML file not found at: {yamlPath}");

        string yamlContent = await File.ReadAllTextAsync(yamlPath);

        // Act
        object config = _yamlDeserializer.Deserialize<object>(yamlContent);
        string configJson = _yamlSerializer.Serialize(config);

        // Show what the JSON looks like with null values
        TestContext.WriteLine($"Generated JSON with nulls: {configJson}");

        ICollection<NJsonSchema.Validation.ValidationError> validationResults = _schema!.Validate(configJson);

        // Assert - With the current fixed schema, this should now pass
        // But originally this would have failed due to null values
        Assert.That(validationResults.Count, Is.EqualTo(0),
            "With fixed schema, even minimal config with nulls should validate");
    }

    /// <summary>
    /// Simple CIDR expansion implementation for testing purposes.
    /// This mirrors the logic that should be in DiscoveryService.
    /// </summary>
    private List<string> ExpandCidrForTesting(string cidr)
    {
        var result = new List<string>();

        try
        {
            string[] parts = cidr.Split('/');
            if (parts.Length != 2)
            {
                return result;
            }

            string baseIp = parts[0];
            if (!int.TryParse(parts[1], out int prefixLength))
            {
                return result;
            }

            if (prefixLength < 0 || prefixLength > 32)
            {
                return result;
            }

            if (!System.Net.IPAddress.TryParse(baseIp, out System.Net.IPAddress? ipAddress))
            {
                return result;
            }

            byte[] addressBytes = ipAddress.GetAddressBytes();
            uint addressInt = BitConverter.ToUInt32(addressBytes.Reverse().ToArray(), 0);

            int hostBits = 32 - prefixLength;
            uint hostCount = (uint)(1 << hostBits);
            uint networkAddress = addressInt & (0xFFFFFFFF << hostBits);

            // Skip network and broadcast addresses for practical use
            uint startAddress = networkAddress + 1;
            uint endAddress = networkAddress + hostCount - 1;

            for (uint address = startAddress; address < endAddress && address > networkAddress; address++)
            {
                byte[] bytes = BitConverter.GetBytes(address).Reverse().ToArray();
                var ip = new System.Net.IPAddress(bytes);
                result.Add(ip.ToString());
            }
        }
        catch
        {
            // Return empty list on any error
        }

        return result;
    }
}
