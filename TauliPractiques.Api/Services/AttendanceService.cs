using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class AttendanceService
    {
        private readonly AttendanceResource _attendanceResource;

        public AttendanceService(AttendanceResource attendanceResource)
        {
            _attendanceResource = attendanceResource;
        }

        public async Task<string> GenerateQrTokenAsync(Guid sessionId)
        {
            return await _attendanceResource.GenerateQrTokenAsync(sessionId);
        }

        public async Task<bool> RegisterAttendanceByTokenAsync(string token, Guid studentId)
        {
            return await _attendanceResource.RegisterAttendanceByTokenAsync(token, studentId);
        }

        public async Task RegisterManualAttendanceAsync(Guid sessionId, Guid studentId)
        {
            await _attendanceResource.RegisterManualAttendanceAsync(sessionId, studentId);
        }
    }
}