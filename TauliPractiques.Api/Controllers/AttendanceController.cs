using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TauliPractiques.Api.Services;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/attendance")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly AttendanceService _attendanceService;

        public AttendanceController(AttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        // Tutor clínic genera el QR d'una sessió
        [HttpGet("qr/{sessionId}")]
        public async Task<IActionResult> GenerateQr(Guid sessionId)
        {
            var token = await _attendanceService.GenerateQrTokenAsync(sessionId);
            return Ok(new { token });
        }

        // Estudiant escaneja el QR
        [HttpPost("scan")]
        public async Task<IActionResult> ScanQr([FromBody] ScanRequest request)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (studentIdClaim == null || !Guid.TryParse(studentIdClaim, out var studentId))
                return Unauthorized();

            var success = await _attendanceService.RegisterAttendanceByTokenAsync(
                request.Token, studentId);

            if (!success)
                return BadRequest(new { message = "QR invàlid o sessió no trobada." });

            return Ok(new { message = "Assistència registrada correctament." });
        }

        // Fitxatge manual (botó Entrada a la Home de l'estudiant)
        [HttpPost("manual/{sessionId}")]
        public async Task<IActionResult> ManualAttendance(Guid sessionId)
        {
            var studentIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (studentIdClaim == null || !Guid.TryParse(studentIdClaim, out var studentId))
                return Unauthorized();

            await _attendanceService.RegisterManualAttendanceAsync(sessionId, studentId);
            return Ok(new { message = "Assistència registrada correctament." });
        }
    }
}