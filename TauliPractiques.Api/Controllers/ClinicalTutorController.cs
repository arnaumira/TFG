using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TauliPractiques.Api.Services;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/clinical-tutor")]
    [Authorize]
    public class ClinicalTutorController : ControllerBase
    {
        private readonly ClinicalTutorService _clinicalTutorService;

        public ClinicalTutorController(ClinicalTutorService clinicalTutorService)
        {
            _clinicalTutorService = clinicalTutorService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var tutorId = GetTutorId();
            if (tutorId == null) return Unauthorized();

            var tutor = await _clinicalTutorService.GetProfileAsync(tutorId.Value);
            if (tutor == null) return NotFound();

            return Ok(new
            {
                tutor.Id,
                tutor.FullName,
                tutor.Email,
                tutor.Specialty,
                tutor.Department,
                tutor.LicenseNumber
            });
        }

        [HttpGet("students")]
        public async Task<IActionResult> GetAssignedStudents()
        {
            var tutorId = GetTutorId();
            if (tutorId == null) return Unauthorized();

            var students = await _clinicalTutorService.GetAssignedStudentsAsync(tutorId.Value);
            return Ok(students);
        }

        [HttpGet("attendance/today")]
        public async Task<IActionResult> GetTodayAttendance()
        {
            var tutorId = GetTutorId();
            if (tutorId == null) return Unauthorized();

            var attendance = await _clinicalTutorService.GetTodayAttendanceAsync(tutorId.Value);
            return Ok(attendance);
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetSessions([FromQuery] int? year, [FromQuery] int? month)
        {
            var tutorId = GetTutorId();
            if (tutorId == null) return Unauthorized();

            var y = year ?? DateTime.Now.Year;
            var m = month ?? DateTime.Now.Month;

            var sessions = await _clinicalTutorService.GetSessionsByMonthAsync(
                tutorId.Value, y, m);
            return Ok(sessions);
        }

        private Guid? GetTutorId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}