using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class SessionChangeRequestService
    {
        private readonly SessionChangeRequestResource _resource;

        public SessionChangeRequestService(SessionChangeRequestResource resource)
        {
            _resource = resource;
        }

        public async Task CreateAsync(SessionChangeRequest request, Guid studentId)
        {
            request.Id = Guid.NewGuid();
            request.StudentId = studentId;
            request.Status = "pending";
            request.CreatedAt = DateTime.UtcNow;
            await _resource.CreateAsync(request);
        }

        public async Task<IEnumerable<SessionChangeRequestDetail>> GetByAssignmentAsync(
            Guid assignmentId)
        {
            return await _resource.GetByAssignmentAsync(assignmentId);
        }

        public async Task<IEnumerable<DateTime>> GetWorkedDatesAsync(Guid assignmentId)
        {
            return await _resource.GetWorkedDatesAsync(assignmentId);
        }

        public async Task<IEnumerable<SessionChangeRequestDetail>> GetPendingByAcademicTutorAsync(
            Guid academicTutorId)
        {
            return await _resource.GetPendingByAcademicTutorAsync(academicTutorId);
        }

        public async Task ApproveAsync(Guid requestId)
        {
            await _resource.ApproveAndUpdateSessionAsync(requestId);
        }

        public async Task RejectAsync(Guid requestId)
        {
            await _resource.UpdateStatusAsync(requestId, "rejected");
        }
    }
}