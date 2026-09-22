using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Services;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EvaluationController : ControllerBase
    {
        private readonly EvaluationService _evaluationService;

        public EvaluationController(EvaluationService evaluationService)
        {
            _evaluationService = evaluationService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Evaluation evaluation)
        {
            var tutorId = GetUserId();
            if (tutorId == null) return Unauthorized();

            var created = await _evaluationService.CreateEvaluationAsync(evaluation, tutorId.Value);
            return Ok(created);
        }

        [HttpGet("assignment/{assignmentId}")]
        public async Task<IActionResult> GetByAssignment(Guid assignmentId)
        {
            var evaluations = await _evaluationService.GetByAssignmentAsync(assignmentId);
            return Ok(evaluations);
        }

        [HttpGet("assignment/{assignmentId}/rubric/{rubricId}")]
        public async Task<IActionResult> GetByAssignmentAndRubric(Guid assignmentId, Guid rubricId)
        {
            var evaluation = await _evaluationService.GetByAssignmentAndRubricAsync(
                assignmentId, rubricId);

            if (evaluation == null)
                return NotFound();

            return Ok(evaluation);
        }

        [HttpPut("{evaluationId}")]
        public async Task<IActionResult> Update(Guid evaluationId, [FromBody] Evaluation evaluation)
        {
            await _evaluationService.UpdateEvaluationAsync(evaluationId, evaluation);
            return Ok(new { message = "Avaluació actualitzada." });
        }

        private Guid? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}