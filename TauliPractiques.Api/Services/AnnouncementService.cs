using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class AnnouncementService
    {
        private readonly AnnouncementResource _resource;

        public AnnouncementService(AnnouncementResource resource)
        {
            _resource = resource;
        }

        public async Task CreateAsync(Announcement a, Guid coordinatorId)
        {
            a.Id = Guid.NewGuid();
            a.CreatedBy = coordinatorId;
            a.CreatedAt = DateTime.UtcNow;
            await _resource.CreateAsync(a);
        }

        public Task<IEnumerable<Announcement>> GetSentAsync(Guid coordinatorId)
            => _resource.GetSentAsync(coordinatorId);

        public Task<IEnumerable<AnnouncementDetail>> GetForUserAsync(Guid userId, string role)
            => _resource.GetForUserAsync(userId, role);

        public Task<int> GetUnreadCountAsync(Guid userId, string role)
            => _resource.GetUnreadCountAsync(userId, role);

        public Task MarkReadAsync(Guid announcementId, Guid userId)
            => _resource.MarkReadAsync(announcementId, userId);

        public Task DeleteAsync(Guid id) => _resource.DeleteAsync(id);
    }
}