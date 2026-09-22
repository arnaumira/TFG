using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Services;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/session-change-requests")]
    [Authorize]
    public class SessionChangeRequestController : ControllerBase
    {
        private readonly SessionChangeRequestService _service;

        public SessionChangeRequestController(SessionChangeRequestService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SessionChangeRequest request)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (studentIdClaim == null || !Guid.TryParse(studentIdClaim, out var studentId))
                return Unauthorized();

            await _service.CreateAsync(request, studentId);
            return Ok(new { message = "Sol·licitud enviada correctament." });
        }

        [HttpGet("assignment/{assignmentId}")]
        public async Task<IActionResult> GetByAssignment(Guid assignmentId)
        {
            var requests = await _service.GetByAssignmentAsync(assignmentId);
            return Ok(requests);
        }

        [HttpGet("worked-dates/{assignmentId}")]
        public async Task<IActionResult> GetWorkedDates(Guid assignmentId)
        {
            var dates = await _service.GetWorkedDatesAsync(assignmentId);
            return Ok(dates);
        }

        [HttpGet("academic-tutor")]
        public async Task<IActionResult> GetByAcademicTutor()
        {
            var tutorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (tutorIdClaim == null || !Guid.TryParse(tutorIdClaim, out var tutorId))
                return Unauthorized();

            var requests = await _service.GetPendingByAcademicTutorAsync(tutorId);
            return Ok(requests);
        }

        [HttpPatch("{requestId}/approve")]
        public async Task<IActionResult> Approve(Guid requestId)
        {
            await _service.ApproveAsync(requestId);
            return Ok(new { message = "Sol·licitud aprovada i sessió actualitzada." });
        }

        [HttpPatch("{requestId}/reject")]
        public async Task<IActionResult> Reject(Guid requestId)
        {
            await _service.RejectAsync(requestId);
            return Ok(new { message = "Sol·licitud denegada." });
        }
    }
}