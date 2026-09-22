using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class ClinicalTutorService
    {
        private readonly ClinicalTutorResource _clinicalTutorResource;

        public ClinicalTutorService(ClinicalTutorResource clinicalTutorResource)
        {
            _clinicalTutorResource = clinicalTutorResource;
        }

        public async Task<ClinicalTutor?> GetProfileAsync(Guid tutorId)
        {
            return await _clinicalTutorResource.GetByIdAsync(tutorId);
        }

        public async Task<IEnumerable<StudentSummary>> GetAssignedStudentsAsync(Guid tutorId)
        {
            return await _clinicalTutorResource.GetAssignedStudentsAsync(tutorId);
        }

        public async Task<IEnumerable<TodayAttendance>> GetTodayAttendanceAsync(Guid tutorId)
        {
            return await _clinicalTutorResource.GetTodayAttendanceAsync(tutorId);
        }

        public async Task<IEnumerable<SessionDetail>> GetSessionsByMonthAsync(Guid tutorId, int year, int month)
        {
            return await _clinicalTutorResource.GetSessionsByMonthAsync(tutorId, year, month);
        }
    }
}