using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class AcademicTutorService
    {
        private readonly AcademicTutorResource _academicTutorResource;
        private readonly EvaluationResource _evaluationResource;

        public AcademicTutorService(
            AcademicTutorResource academicTutorResource,
            EvaluationResource evaluationResource)
        {
            _academicTutorResource = academicTutorResource;
            _evaluationResource = evaluationResource;
        }

        public async Task<AcademicTutor?> GetProfileAsync(Guid tutorId)
        {
            return await _academicTutorResource.GetByIdAsync(tutorId);
        }

        public async Task<IEnumerable<StudentSummary>> GetAssignedStudentsAsync(Guid tutorId)
        {
            return await _academicTutorResource.GetAssignedStudentsAsync(tutorId);
        }

        public async Task<IEnumerable<TodayAttendance>> GetTodayAttendanceAsync(Guid tutorId)
        {
            return await _academicTutorResource.GetTodayAttendanceAsync(tutorId);
        }

        public async Task<IEnumerable<SessionDetail>> GetSessionsByMonthAsync(
            Guid tutorId, int year, int month)
        {
            return await _academicTutorResource.GetSessionsByMonthAsync(tutorId, year, month);
        }

        public async Task<IEnumerable<EvaluationDetail>> GetStudentEvaluationsAsync(
            Guid assignmentId)
        {
            return await _evaluationResource.GetByAssignmentAsync(assignmentId);
        }
    }
}