using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TauliPractiques.Api.Services;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentController : ControllerBase
    {
        private readonly StudentService _studentService;

        public StudentController(StudentService studentService)
        {
            _studentService = studentService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (studentIdClaim == null || !Guid.TryParse(studentIdClaim, out var studentId))
                return Unauthorized();

            var student = await _studentService.GetMyProfileAsync(studentId);

            if (student == null)
                return NotFound(new { message = "Estudiant no trobat." });

            return Ok(new
            {
                student.Id,
                student.FullName,
                student.Email,
                student.University,
                student.Niu,
                student.EnrollmentYear,
                student.CurrentCourse,
                student.Degree
            });
        }
    }
}