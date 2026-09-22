using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class AssignmentService
    {
        private readonly AssignmentResource _assignmentResource;

        public AssignmentService(AssignmentResource assignmentResource)
        {
            _assignmentResource = assignmentResource;
        }

        public async Task<AssignmentDetail?> GetCurrentAssignmentAsync(Guid studentId)
        {
            return await _assignmentResource.GetCurrentAssignmentByStudentAsync(studentId);
        }
    }
}