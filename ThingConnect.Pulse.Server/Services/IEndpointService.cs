using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services;

public interface IEndpointService
{
    /// <summary>
    /// Retrieves detailed information for a specific endpoint
    /// </summary>
    /// <param name="endpointId">Unique identifier of the endpoint</param>
    /// <returns>Detailed endpoint information or null if not found</returns>
    Task<EndpointDetailDto?> GetEndpointByIdAsync(Guid endpointId);

    /// <summary>
    /// Retrieves a list of endpoint summaries
    /// </summary>
    /// <returns>Collection of endpoint summaries</returns>
    Task<IEnumerable<EndpointSummaryDto>> GetAllEndpointsAsync();

    /// <summary>
    /// Creates a new endpoint
    /// </summary>
    /// <param name="endpointDto">Details of the endpoint to create</param>
    /// <returns>The created endpoint's ID</returns>
    Task<Guid> CreateEndpointAsync(EndpointDetailDto endpointDto);

    /// <summary>
    /// Updates an existing endpoint
    /// </summary>
    /// <param name="endpointDto">Updated endpoint details</param>
    /// <returns>True if update successful, false otherwise</returns>
    Task<bool> UpdateEndpointAsync(EndpointDetailDto endpointDto);

    /// <summary>
    /// Deletes an endpoint
    /// </summary>
    /// <param name="endpointId">ID of the endpoint to delete</param>
    /// <returns>True if deletion successful, false otherwise</returns>
    Task<bool> DeleteEndpointAsync(Guid endpointId);
}