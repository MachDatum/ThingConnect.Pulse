using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services.Reports;

public interface IReportDataService
{
    Task<AvailabilityReport> GetAvailabilityReportAsync(AvailabilityReportRequest request, CancellationToken cancellationToken = default);
}
