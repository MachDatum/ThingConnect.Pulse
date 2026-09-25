using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services.Reports;

public interface IReportDataService
{
    Task<List<MachineAvailabilityRowDto>> GetMachineAvailabilityAsync(DateTimeOffset from, DateTimeOffset to, List<string>? groupIds);

    Task<ExecutiveSummaryDto> GetExecutiveSummaryAsync(DateTimeOffset from, DateTimeOffset to, List<string>? groupIds);
}
