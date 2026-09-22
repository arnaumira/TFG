using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Services;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/announcements")]
    [Authorize]
    public class AnnouncementController : ControllerBase
    {
        private readonly AnnouncementService _service;

        public AnnouncementController(AnnouncementService service)
        {
            _service = service;
        }

        private Guid? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }

        private string? GetRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value
                ?? User.FindFirst("role")?.Value;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Announcement a)
        {
            var id = GetUserId();
            if (id == null) return Unauthorized();
            await _service.CreateAsync(a, id.Value);
            return Ok(new { message = "Avís publicat." });
        }

        [HttpGet("sent")]
        public async Task<IActionResult> GetSent()
        {
            var id = GetUserId();
            if (id == null) return Unauthorized();
            return Ok(await _service.GetSentAsync(id.Value));
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMine()
        {
            var id = GetUserId();
            var role = GetRole();
            if (id == null || role == null) return Unauthorized();
            return Ok(await _service.GetForUserAsync(id.Value, role));
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var id = GetUserId();
            var role = GetRole();
            if (id == null || role == null) return Unauthorized();
            return Ok(new { count = await _service.GetUnreadCountAsync(id.Value, role) });
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkRead(Guid id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            await _service.MarkReadAsync(id, userId.Value);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id);
            return Ok(new { message = "Avís eliminat." });
        }
    }
}