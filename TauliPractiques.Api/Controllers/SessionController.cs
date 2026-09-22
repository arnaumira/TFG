using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Services;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/assignment/{assignmentId}/sessions")]
    [Authorize]
    public class SessionController : ControllerBase
    {
        private readonly SessionService _sessionService;

        public SessionController(SessionService sessionService)
        {
            _sessionService = sessionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSessions(
            Guid assignmentId,
            [FromQuery] int? year,
            [FromQuery] int? month)
        {
            var y = year ?? DateTime.Now.Year;
            var m = month ?? DateTime.Now.Month;

            var sessions = await _sessionService.GetSessionsByMonthAsync(assignmentId, y, m);
            return Ok(sessions);
        }

        [HttpGet("{date}")]
        public async Task<IActionResult> GetSessionByDate(Guid assignmentId, DateTime date)
        {
            var session = await _sessionService.GetSessionByDateAsync(assignmentId, date);
            if (session == null)
                return NotFound(new { message = "No hi ha sessió per aquest dia." });

            return Ok(session);
        }

        [HttpPatch("{sessionId}")]
        public async Task<IActionResult> UpdateSession(
            Guid assignmentId, Guid sessionId, [FromBody] Session request)
        {
            await _sessionService.UpdateSessionAsync(sessionId, request);
            return Ok(new { message = "Sessió actualitzada correctament." });
        }
    }
}