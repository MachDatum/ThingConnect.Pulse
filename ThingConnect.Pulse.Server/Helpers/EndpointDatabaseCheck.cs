using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ThingConnect.Pulse.Server.Helpers
{
    public class EndpointDatabaseCheck
    {
        public static async Task CheckEndpoint(string endpointId)
        {
            // Setup dependency injection
            var services = new ServiceCollection();
            services.AddDbContext<PulseDbContext>(options =>
                options.UseSqlite("Data Source=C:\\ProgramData\\ThingConnect.Pulse\\pulse.db"));
            services.AddLogging(configure => configure.AddConsole());

            var serviceProvider = services.BuildServiceProvider();

            // Get DbContext
            using (var scope = serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<PulseDbContext>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<EndpointDatabaseCheck>>();

                // Get all endpoint IDs
                var allEndpointIds = await dbContext.Endpoints.Select(e => e.Id).ToListAsync();
                logger.LogInformation($"Total endpoints: {allEndpointIds.Count}");
                logger.LogInformation($"Existing endpoint IDs: {string.Join(", ", allEndpointIds)}");

                // Try to find specific endpoint
                var endpoint = await dbContext.Endpoints
                    .Include(e => e.Group)
                    .FirstOrDefaultAsync(e => e.Id.ToString() == endpointId);

                if (endpoint == null)
                {
                    logger.LogWarning($"No endpoint found with ID: {endpointId}");
                }
                else
                {
                    logger.LogInformation($"Endpoint found:");
                    logger.LogInformation($"ID: {endpoint.Id}");
                    logger.LogInformation($"Name: {endpoint.Name}");
                    logger.LogInformation($"Host: {endpoint.Host}");
                    logger.LogInformation($"Type: {endpoint.Type}");
                    logger.LogInformation($"Group: {endpoint.Group?.Name}");
                }
            }
        }

        public static void Main(string[] args)
        {
            var endpointId = "08cdeb28-71d6-4732-b11d-f945fe9c15dc";
            CheckEndpoint(endpointId).Wait();
        }
    }
}