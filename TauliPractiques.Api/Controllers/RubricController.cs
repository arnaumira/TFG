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
    public class RubricController : ControllerBase
    {
        private readonly RubricService _rubricService;

        public RubricController(RubricService rubricService)
        {
            _rubricService = rubricService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var rubrics = await _rubricService.GetAllActiveAsync();
            return Ok(rubrics);
        }

        [HttpGet("{rubricId}")]
        public async Task<IActionResult> GetWithCriteria(Guid rubricId)
        {
            var rubric = await _rubricService.GetWithCriteriaAsync(rubricId);
            if (rubric == null)
                return NotFound(new { message = "Rúbrica no trobada." });

            return Ok(rubric);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Rubric rubric)
        {
            var createdById = GetUserId();
            if (createdById == null) return Unauthorized();

            var created = await _rubricService.CreateRubricWithCriteriaAsync(
                rubric, rubric.Criteria, createdById.Value);

            return Ok(created);
        }

        [HttpDelete("{rubricId}")]
        public async Task<IActionResult> Deactivate(Guid rubricId)
        {
            await _rubricService.DeactivateRubricAsync(rubricId);
            return Ok(new { message = "Rúbrica desactivada." });
        }

        [HttpPut("{rubricId}")]
        public async Task<IActionResult> Update(Guid rubricId, [FromBody] Rubric rubric)
        {
            rubric.Id = rubricId;
            await _rubricService.UpdateRubricAsync(rubric);
            return Ok(new { message = "Rúbrica actualitzada." });
        }

        private Guid? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}