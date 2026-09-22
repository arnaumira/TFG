using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Services;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/assignment/{assignmentId}/schedules")]
    [Authorize]
    public class AssignmentScheduleController : ControllerBase
    {
        private readonly AssignmentScheduleService _scheduleService;

        public AssignmentScheduleController(AssignmentScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSchedule(
            Guid assignmentId, [FromBody] AssignmentSchedule schedule)
        {
            schedule.AssignmentId = assignmentId;
            var created = await _scheduleService.CreateScheduleAndGenerateSessionsAsync(schedule);
            return Ok(created);
        }

        [HttpGet]
        public async Task<IActionResult> GetSchedules(Guid assignmentId)
        {
            var schedules = await _scheduleService.GetSchedulesByAssignmentAsync(assignmentId);
            return Ok(schedules);
        }

        [HttpPut("{scheduleId}")]
        public async Task<IActionResult> UpdateSchedule(
    Guid assignmentId, Guid scheduleId, [FromBody] AssignmentSchedule schedule)
        {
            schedule.Id = scheduleId;
            schedule.AssignmentId = assignmentId;
            await _scheduleService.UpdateScheduleAsync(schedule);
            return Ok(new { message = "Horari actualitzat i sessions futures regenerades." });
        }

        [HttpDelete("{scheduleId}")]
        public async Task<IActionResult> DeleteSchedule(Guid assignmentId, Guid scheduleId)
        {
            await _scheduleService.DeleteScheduleAsync(scheduleId);
            return Ok(new { message = "Horari eliminat." });
        }
    }
}