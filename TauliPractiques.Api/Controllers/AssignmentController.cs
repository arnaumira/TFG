using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TauliPractiques.Api.Services;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssignmentController : ControllerBase
    {
        private readonly AssignmentService _assignmentService;

        public AssignmentController(AssignmentService assignmentService)
        {
            _assignmentService = assignmentService;
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentAssignment()
        {
            var studentId = GetStudentId();

            if (studentId == null)
            {
                Console.WriteLine("ERROR: studentId és null");
                return Unauthorized();
            }

            Console.WriteLine($"Buscant assignment per studentId: {studentId}");

            var assignment = await _assignmentService.GetCurrentAssignmentAsync(studentId.Value);

            Console.WriteLine($"Assignment trobada: {assignment?.Id.ToString() ?? "NULL"}");

            if (assignment == null)
                return NotFound(new { message = "No s'ha trobat cap assignació activa." });

            return Ok(assignment);
        }

        private Guid? GetStudentId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}