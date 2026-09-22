using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class SessionService
    {
        private readonly SessionResource _sessionResource;

        public SessionService(SessionResource sessionResource)
        {
            _sessionResource = sessionResource;
        }

        public async Task<IEnumerable<SessionDetail>> GetSessionsByMonthAsync(
            Guid assignmentId, int year, int month)
        {
            return await _sessionResource.GetSessionsByStudentAndMonthAsync(
                assignmentId, year, month);
        }

        public async Task<SessionDetail?> GetSessionByDateAsync(Guid assignmentId, DateTime date)
        {
            return await _sessionResource.GetSessionByDateAsync(assignmentId, date);
        }

        public async Task UpdateSessionAsync(Guid sessionId, Session request)
        {
            await _sessionResource.UpdateSessionAsync(
                sessionId,
                request.Building,
                request.Floor,
                request.Unit,
                request.ClinicalTutorId,
                request.StartTime,
                request.EndTime,
                request.Notes);
        }
    }
}