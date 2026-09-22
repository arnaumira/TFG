using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TauliPractiques.Api.Services;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/academic-tutor")]
    [Authorize]
    public class AcademicTutorController : ControllerBase
    {
        private readonly AcademicTutorService _academicTutorService;

        public AcademicTutorController(AcademicTutorService academicTutorService)
        {
            _academicTutorService = academicTutorService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var tutorId = GetTutorId();
            if (tutorId == null) return Unauthorized();

            var tutor = await _academicTutorService.GetProfileAsync(tutorId.Value);
            if (tutor == null) return NotFound();

            return Ok(new
            {
                tutor.Id,
                tutor.FullName,
                tutor.Email,
                tutor.Faculty,
                tutor.Department,
                tutor.OfficeLocation
            });
        }

        [HttpGet("students")]
        public async Task<IActionResult> GetAssignedStudents()
        {
            var tutorId = GetTutorId();
            if (tutorId == null) return Unauthorized();

            var students = await _academicTutorService.GetAssignedStudentsAsync(tutorId.Value);
            return Ok(students);
        }

        [HttpGet("attendance/today")]
        public async Task<IActionResult> GetTodayAttendance()
        {
            var tutorId = GetTutorId();
            if (tutorId == null) return Unauthorized();

            var attendance = await _academicTutorService.GetTodayAttendanceAsync(tutorId.Value);
            return Ok(attendance);
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetSessions(
            [FromQuery] int? year, [FromQuery] int? month)
        {
            var tutorId = GetTutorId();
            if (tutorId == null) return Unauthorized();

            var y = year ?? DateTime.Now.Year;
            var m = month ?? DateTime.Now.Month;

            var sessions = await _academicTutorService.GetSessionsByMonthAsync(
                tutorId.Value, y, m);
            return Ok(sessions);
        }

        [HttpGet("evaluations/{assignmentId}")]
        public async Task<IActionResult> GetStudentEvaluations(Guid assignmentId)
        {
            var evaluations = await _academicTutorService.GetStudentEvaluationsAsync(assignmentId);
            return Ok(evaluations);
        }

        private Guid? GetTutorId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}