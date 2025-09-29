using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services
{
    public sealed class GroupService : IGroupService
    {
        private readonly PulseDbContext _context;

        public GroupService(PulseDbContext context)
        {
            _context = context;
        }

        public async Task<List<GroupDto>> GetAllGroupsAsync()
        {
            return await _context.Groups
                .Select(g => new GroupDto
                {
                    Id = g.Id,
                    Name = g.Name,
                    ParentId = g.ParentId,
                    Color = g.Color,
                    SortOrder = g.SortOrder
                })
                .OrderBy(g => g.SortOrder)
                .ToListAsync();
        }

        public async Task<GroupDto?> GetGroupByIdAsync(string groupId)
        {
            var group = await _context.Groups
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null) return null;

            return new GroupDto
            {
                Id = group.Id,
                Name = group.Name,
                ParentId = group.ParentId,
                Color = group.Color,
                SortOrder = group.SortOrder
            };
        }
    }
}
