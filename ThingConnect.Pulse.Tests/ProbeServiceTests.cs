using Microsoft.Extensions.Logging;
using NUnit.Framework;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Services.Monitoring;
using Moq;

namespace ThingConnect.Pulse.Tests
{
    [TestFixture]
    public class ProbeServiceTests
    {
        private Mock<ILogger<ProbeService>> _loggerMock;
        private IHttpClientFactory _httpClientFactory;

        [SetUp]
        public void Setup()
        {
            _loggerMock = new Mock<ILogger<ProbeService>>();

            // Setup HttpClientFactory with a test client
            var client = new HttpClient();
            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(f => f.CreateClient("ProbeClient")).Returns(client);
            _httpClientFactory = httpClientFactoryMock.Object;
        }

        [Test]
        public async Task PingAsync_ShouldReturnSuccess_ForIPv4()
        {
            var service = new ProbeService(_loggerMock.Object, _httpClientFactory);
            var result = await service.PingAsync(Guid.NewGuid(), "8.8.8.8", 2000);
            Assert.That(result, Is.True);
        }

        [Test]
        public async Task PingAsync_ShouldReturnSuccess_ForIPv6()
        {
            var service = new ProbeService(_loggerMock.Object, _httpClientFactory);
            var result = await service.PingAsync(Guid.NewGuid(), "2001:4860:4860::8888", 2000);
            Assert.That(result, Is.True);
        }

        [Test]
        public async Task TcpConnectAsync_ShouldReturnSuccess_ForIPv4()
        {
            var service = new ProbeService(_loggerMock.Object, _httpClientFactory);
            var result = await service.TcpConnectAsync(Guid.NewGuid(), "8.8.8.8", 53, 2000);
            Assert.That(result, Is.True);
        }

        [Test]
        public async Task TcpConnectAsync_ShouldReturnSuccess_ForIPv6()
        {
            var service = new ProbeService(_loggerMock.Object, _httpClientFactory);
            var result = await service.TcpConnectAsync(Guid.NewGuid(), "2001:4860:4860::8888", 53, 2000);
            Assert.That(result, Is.True);
        }

        [Test]
        public async Task HttpCheckAsync_ShouldReturnSuccess_ForIPv4()
        {
            var service = new ProbeService(_loggerMock.Object, _httpClientFactory);
            var result = await service.HttpCheckAsync(
                Guid.NewGuid(),
                "example.com",
                80,
                "/",
                "Example Domain",
                5000
            );
            Assert.That(result, Is.True);
        }

        [Test]
        public async Task HttpCheckAsync_ShouldReturnSuccess_ForIPv6()
        {
            var service = new ProbeService(_loggerMock.Object, _httpClientFactory);
            var result = await service.HttpCheckAsync(
                Guid.NewGuid(),
                "2606:2800:220:1:248:1893:25c8:1946", // example.com IPv6
                80,
                "/",
                "Example Domain",
                5000
            );
            Assert.That(result, Is.True);
        }

        [Test]
        public async Task ProbeAsync_ShouldHandleUnknownProbeType()
        {
            var service = new ProbeService(_loggerMock.Object, _httpClientFactory);
            var endpoint = new Endpoint
            {
                Id = Guid.NewGuid(),
                Type = (ProbeType)999, // Invalid probe type
                Host = "example.com"
            };
            var result = await service.ProbeAsync(endpoint);
            Assert.That(result, Is.False);
            Assert.That(result, Does.Contain("Unknown probe type"));
        }
    }
}
