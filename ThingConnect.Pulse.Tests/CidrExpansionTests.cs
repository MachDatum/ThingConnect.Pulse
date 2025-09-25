using System.Net;
using System.Text.RegularExpressions;
using NUnit.Framework;

namespace ThingConnect.Pulse.Tests;

[TestFixture]
public class CidrExpansionTests
{
    private static readonly Regex CidrRegex = new(@"^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/(\d{1,2})$",
        RegexOptions.Compiled);

    // Standalone CIDR expansion method for testing - copied from DiscoveryService
    private IEnumerable<string> ExpandCidr(string cidr)
    {
        Match match = CidrRegex.Match(cidr);
        if (!match.Success)
        {
            Console.WriteLine($"WARNING: Invalid CIDR format: {cidr}");
            yield break;
        }

        string baseIp = match.Groups[1].Value;
        int prefixLength = int.Parse(match.Groups[2].Value);

        if (prefixLength < 0 || prefixLength > 32)
        {
            Console.WriteLine($"WARNING: Invalid CIDR prefix length: {prefixLength}");
            yield break;
        }

        if (!IPAddress.TryParse(baseIp, out IPAddress? ipAddress))
        {
            Console.WriteLine($"WARNING: Invalid IP address in CIDR: {baseIp}");
            yield break;
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
            var ip = new IPAddress(bytes);
            yield return ip.ToString();
        }
    }

    [Test]
    public void TestCidrExpansion_With24Subnet_ShouldReturn254IPs()
    {
        // Arrange
        string cidr = "10.18.8.0/24";

        // Act
        var expandedIPs = ExpandCidr(cidr).ToList();

        // Assert
        Console.WriteLine($"Testing CIDR expansion for: {cidr}");
        Console.WriteLine($"Expected: 254 IP addresses from 10.18.8.1 to 10.18.8.254");
        Console.WriteLine($"Actual count: {expandedIPs.Count}");

        Assert.That(expandedIPs.Count, Is.EqualTo(254), $"CIDR /24 should expand to 254 IPs but got {expandedIPs.Count}");

        if (expandedIPs.Count > 0)
        {
            Console.WriteLine($"First IP: {expandedIPs.First()}");
            Console.WriteLine($"Last IP: {expandedIPs.Last()}");

            Assert.That(expandedIPs.First(), Is.EqualTo("10.18.8.1"), "First IP should be .1");
            Assert.That(expandedIPs.Last(), Is.EqualTo("10.18.8.254"), "Last IP should be .254");

            // Print first and last 5 IPs for debugging
            Console.WriteLine("First 5 IPs:");
            foreach (string? ip in expandedIPs.Take(5))
            {
                Console.WriteLine($"  {ip}");
            }
            Console.WriteLine("Last 5 IPs:");
            foreach (string? ip in expandedIPs.TakeLast(5))
            {
                Console.WriteLine($"  {ip}");
            }
        }
    }

    [Test]
    public void TestCidrExpansion_With30Subnet_ShouldReturn2IPs()
    {
        // Arrange
        string cidr = "192.168.1.0/30";

        // Act
        var expandedIPs = ExpandCidr(cidr).ToList();

        // Assert
        Console.WriteLine($"Testing CIDR expansion for: {cidr}");
        Console.WriteLine($"Actual count: {expandedIPs.Count}");

        Assert.That(expandedIPs.Count, Is.EqualTo(2), "CIDR /30 should expand to 2 IPs");
        Assert.That(expandedIPs[0], Is.EqualTo("192.168.1.1"));
        Assert.That(expandedIPs[1], Is.EqualTo("192.168.1.2"));

        Console.WriteLine("All IPs:");
        foreach (string? ip in expandedIPs)
        {
            Console.WriteLine($"  {ip}");
        }
    }

    [Test]
    public void TestCidrExpansion_WithInvalidFormat_ShouldReturnEmpty()
    {
        // Arrange
        string invalidCidr = "invalid-cidr";

        // Act
        var expandedIPs = ExpandCidr(invalidCidr).ToList();

        // Assert
        Console.WriteLine($"Testing invalid CIDR: {invalidCidr}");
        Console.WriteLine($"Actual count: {expandedIPs.Count}");

        Assert.That(expandedIPs.Count, Is.EqualTo(0), "Invalid CIDR should return empty list");
    }

    [Test]
    public void TestCidrExpansion_UserScenario_10_18_8_0_24()
    {
        // Arrange - This is the exact CIDR from the user's config
        string cidr = "10.18.8.0/24";

        // Act
        var expandedIPs = ExpandCidr(cidr).ToList();

        // Assert
        Console.WriteLine($"Testing USER'S CIDR: {cidr}");
        Console.WriteLine($"Expected: 254 IP addresses from 10.18.8.1 to 10.18.8.254");
        Console.WriteLine($"Actual count: {expandedIPs.Count}");

        Assert.That(expandedIPs.Count, Is.EqualTo(254), $"User's CIDR {cidr} should expand to 254 IPs but got {expandedIPs.Count}");

        if (expandedIPs.Count > 0)
        {
            Console.WriteLine($"First IP: {expandedIPs.First()}");
            Console.WriteLine($"Last IP: {expandedIPs.Last()}");

            Assert.That(expandedIPs.First(), Is.EqualTo("10.18.8.1"), "First IP should be .1");
            Assert.That(expandedIPs.Last(), Is.EqualTo("10.18.8.254"), "Last IP should be .254");

            // Print first and last 3 IPs for debugging
            Console.WriteLine("First 3 IPs:");
            foreach (string? ip in expandedIPs.Take(3))
            {
                Console.WriteLine($"  {ip}");
            }
            Console.WriteLine("Last 3 IPs:");
            foreach (string? ip in expandedIPs.TakeLast(3))
            {
                Console.WriteLine($"  {ip}");
            }
        }
        else
        {
            Assert.Fail("CRITICAL: CIDR expansion returned ZERO IPs! This explains why CIDR is not working.");
        }
    }
    
    [Test]
    public void TestIpv6CidrExpansion_SmallRange_ShouldReturnExpectedIPs()
    {
        // Arrange
        string cidr = "2001:db8::/126"; // small /126 subnet: 4 addresses, 2 usable

        // Act
        var expandedIPs = DiscoveryService.Ipv6CidrExpander.Expand(cidr).ToList();

        // Assert
        Assert.That(expandedIPs.Count, Is.EqualTo(4), "IPv6 /126 should expand to 4 IPs");
        Assert.That(expandedIPs[0], Does.StartWith("2001:db8::"));
        Console.WriteLine("Expanded IPv6 IPs:");
        expandedIPs.ForEach(Console.WriteLine);
    }

    [Test]
    public void TestIpv6CidrExpansion_PrefixTooLarge_ShouldThrow()
    {
        // Arrange
        string cidr = "2001:db8::/64";

        // Act & Assert
        Assert.Throws<ArgumentException>(() => DiscoveryService.Ipv6CidrExpander.Expand(cidr).ToList(),
            "Prefixes smaller than /120 should throw exception for practical expansion");
    }

}
