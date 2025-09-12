using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services;

public class EndpointService : IEndpointService
{
    private readonly PulseDbContext _dbContext;
    private readonly ILogger<EndpointService> _logger;

    public EndpointService(
        PulseDbContext dbContext, 
        ILogger<EndpointService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<EndpointDetailDto?> GetEndpointByIdAsync(Guid endpointId)
    {
        try 
        {
            _logger.LogInformation($"Retrieving endpoint details for ID: {endpointId}");

            var endpoint = await _dbContext.Endpoints
                .Include(e => e.Group)
                .Include(e => e.LatestCheckResult)
                .FirstOrDefaultAsync(e => e.Id == endpointId);

            if (endpoint == null)
            {
                _logger.LogWarning($"Endpoint not found: {endpointId}");
                return null;
            }

            return new EndpointDetailDto
            {
                Endpoint = new EndpointInfoDto
                {
                    Id = endpoint.Id,
                    Name = endpoint.Name,
                    Host = endpoint.Host,
                    Type = endpoint.Type,
                    Group = new GroupDto 
                    {
                        Id = endpoint.Group.Id,
                        Name = endpoint.Group.Name
                    },
                    IntervalSeconds = endpoint.IntervalSeconds,
                    TimeoutMs = endpoint.TimeoutMs
                },
                LastStatus = endpoint.LastStatus,
                LastCheckTime = endpoint.LatestCheckResult?.Timestamp
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving endpoint details for {endpointId}");
            throw;
        }
    }

    public async Task<IEnumerable<EndpointSummaryDto>> GetAllEndpointsAsync()
    {
        try 
        {
            _logger.LogInformation("Retrieving all endpoint summaries");

            return await _dbContext.Endpoints
                .Include(e => e.Group)
                .Select(e => new EndpointSummaryDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    Host = e.Host,
                    Type = e.Type,
                    LastStatus = e.LastStatus,
                    GroupName = e.Group.Name
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving endpoint summaries");
            throw;
        }
    }

    public async Task<Guid> CreateEndpointAsync(EndpointDetailDto endpointDto)
    {
        try 
        {
            _logger.LogInformation($"Creating new endpoint: {endpointDto.Endpoint.Name}");

            // Find or create group
            var group = await _dbContext.Groups
                .FirstOrDefaultAsync(g => g.Id == endpointDto.Endpoint.Group.Id) 
                ?? new Group 
                {
                    Id = endpointDto.Endpoint.Group.Id,
                    Name = endpointDto.Endpoint.Group.Name
                };

            var endpoint = new Endpoint
            {
                Id = endpointDto.Endpoint.Id == Guid.Empty 
                    ? Guid.NewGuid() 
                    : endpointDto.Endpoint.Id,
                Name = endpointDto.Endpoint.Name,
                Host = endpointDto.Endpoint.Host,
                Type = endpointDto.Endpoint.Type,
                Group = group,
                IntervalSeconds = endpointDto.Endpoint.IntervalSeconds,
                TimeoutMs = endpointDto.Endpoint.TimeoutMs,
                LastStatus = "unknown"
            };

            _dbContext.Endpoints.Add(endpoint);
            await _dbContext.SaveChangesAsync();

            return endpoint.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating endpoint: {endpointDto.Endpoint.Name}");
            throw;
        }
    }

    public async Task<bool> UpdateEndpointAsync(EndpointDetailDto endpointDto)
    {
        try 
        {
            _logger.LogInformation($"Updating endpoint: {endpointDto.Endpoint.Id}");

            var existingEndpoint = await _dbContext.Endpoints
                .Include(e => e.Group)
                .FirstOrDefaultAsync(e => e.Id == endpointDto.Endpoint.Id);

            if (existingEndpoint == null)
            {
                _logger.LogWarning($"Endpoint not found for update: {endpointDto.Endpoint.Id}");
                return false;
            }

            // Update endpoint properties
            existingEndpoint.Name = endpointDto.Endpoint.Name;
            existingEndpoint.Host = endpointDto.Endpoint.Host;
            existingEndpoint.Type = endpointDto.Endpoint.Type;
            existingEndpoint.IntervalSeconds = endpointDto.Endpoint.IntervalSeconds;
            existingEndpoint.TimeoutMs = endpointDto.Endpoint.TimeoutMs;

            // Update group if needed
            if (existingEndpoint.Group.Id != endpointDto.Endpoint.Group.Id)
            {
                var group = await _dbContext.Groups
                    .FirstOrDefaultAsync(g => g.Id == endpointDto.Endpoint.Group.Id);

                if (group == null)
                {
                    group = new Group
                    {
                        Id = endpointDto.Endpoint.Group.Id,
                        Name = endpointDto.Endpoint.Group.Name
                    };
                    _dbContext.Groups.Add(group);
                }

                existingEndpoint.Group = group;
            }

            await _dbContext.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating endpoint: {endpointDto.Endpoint.Id}");
            throw;
        }
    }

    public async Task<bool> DeleteEndpointAsync(Guid endpointId)
    {
        try 
        {
            _logger.LogInformation($"Deleting endpoint: {endpointId}");

            var endpoint = await _dbContext.Endpoints
                .FirstOrDefaultAsync(e => e.Id == endpointId);

            if (endpoint == null)
            {
                _logger.LogWarning($"Endpoint not found for deletion: {endpointId}");
                return false;
            }

            _dbContext.Endpoints.Remove(endpoint);
            await _dbContext.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting endpoint: {endpointId}");
            throw;
        }
    }
}