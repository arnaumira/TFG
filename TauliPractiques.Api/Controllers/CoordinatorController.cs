using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Services;
using System.Security.Claims;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/coordinator")]
    [Authorize]
    public class CoordinatorController : ControllerBase
    {
        private readonly CoordinatorService _coordinatorService;

        public CoordinatorController(CoordinatorService coordinatorService)
        {
            _coordinatorService = coordinatorService;
        }

        [HttpGet("students")]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _coordinatorService.GetAllStudentsAsync();
            return Ok(students);
        }

        [HttpGet("clinical-tutors")]
        public async Task<IActionResult> GetAllClinicalTutors()
        {
            var tutors = await _coordinatorService.GetAllClinicalTutorsAsync();
            return Ok(tutors);
        }

        [HttpGet("academic-tutors")]
        public async Task<IActionResult> GetAllAcademicTutorsAsync()
        {
            var tutors = await _coordinatorService.GetAllAcademicTutorsAsync();
            return Ok(tutors);
        }

        [HttpGet("assignments")]
        public async Task<IActionResult> GetAllAssignments()
        {
            var assignments = await _coordinatorService.GetAllAssignmentsAsync();
            return Ok(assignments);
        }

        [HttpPost("assignments")]
        public async Task<IActionResult> CreateAssignment([FromBody] Assignment assignment)
        {
            try
            {
                var created = await _coordinatorService.CreateAssignmentAsync(assignment);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetSessions(
            [FromQuery] int? year,
            [FromQuery] int? month,
            [FromQuery] Guid? studentId,
            [FromQuery] Guid? clinicalTutorId)
        {
            var y = year ?? DateTime.Now.Year;
            var m = month ?? DateTime.Now.Month;

            var sessions = await _coordinatorService.GetSessionsByMonthAsync(
                y, m, studentId, clinicalTutorId);

            return Ok(sessions);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _coordinatorService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _coordinatorService.GetStatsAsync();
            return Ok(stats);
        }

        [HttpPost("assignments/import-preview")]
        public async Task<IActionResult> ImportPreview(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Cap fitxer rebut." });

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            ms.Position = 0;

            var rows = await _coordinatorService.ParseImportFileAsync(ms);
            return Ok(rows);
        }

        [HttpPost("assignments/import")]
        public async Task<IActionResult> Import([FromBody] List<ImportAssignmentDto> rows)
        {
            var count = await _coordinatorService.ImportAssignmentsAsync(rows);
            return Ok(new { imported = count });
        }

        [HttpPost("rubrics/import-preview")]
        public async Task<IActionResult> ImportRubricsPreview(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Cap fitxer rebut." });

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            ms.Position = 0;

            var rubrics = _coordinatorService.ParseRubricImportFile(ms);
            return Ok(rubrics);
        }

        [HttpPost("rubrics/import")]
        public async Task<IActionResult> ImportRubrics([FromBody] List<RubricImportResult> rubrics)
        {
            var coordinatorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (coordinatorIdClaim == null || !Guid.TryParse(coordinatorIdClaim, out var coordinatorId))
                return Unauthorized();

            var count = await _coordinatorService.ImportRubricsAsync(rubrics, coordinatorId);
            return Ok(new { imported = count });
        }
    }
}