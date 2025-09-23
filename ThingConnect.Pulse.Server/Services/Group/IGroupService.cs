using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services
{
    public interface IGroupService
    {
        Task<List<GroupDto>> GetAllGroupsAsync();
        Task<GroupDto?> GetGroupByIdAsync(string groupId);
    }
}
