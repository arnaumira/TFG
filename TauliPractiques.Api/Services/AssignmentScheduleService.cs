using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class AssignmentScheduleService
    {
        private readonly AssignmentScheduleResource _scheduleResource;
        private readonly SessionResource _sessionResource;
        private readonly AssignmentResource _assignmentResource;

        public AssignmentScheduleService(
            AssignmentScheduleResource scheduleResource,
            SessionResource sessionResource,
            AssignmentResource assignmentResource)
        {
            _scheduleResource = scheduleResource;
            _sessionResource = sessionResource;
            _assignmentResource = assignmentResource;
        }

        public async Task<AssignmentSchedule> CreateScheduleAndGenerateSessionsAsync(
            AssignmentSchedule schedule)
        {
            schedule.Id = Guid.NewGuid();
            schedule.CreatedAt = DateTime.UtcNow;
            var created = await _scheduleResource.CreateScheduleAsync(schedule);

            var assignment = await _assignmentResource.GetByIdAsync(schedule.AssignmentId);
            if (assignment == null) return created;

            // Generem des de la data d'inici de l'assignment
            var sessions = GenerateSessions(created, assignment.StartDate, assignment.EndDate);
            if (sessions.Any())
                await _sessionResource.CreateManyAsync(sessions);

            return created;
        }

        public async Task<IEnumerable<AssignmentSchedule>> GetSchedulesByAssignmentAsync(
            Guid assignmentId)
        {
            return await _scheduleResource.GetByAssignmentAsync(assignmentId);
        }

        public async Task UpdateScheduleAsync(AssignmentSchedule schedule)
        {
            // 1. Actualitza el schedule
            await _scheduleResource.UpdateScheduleAsync(schedule);

            // 2. Esborra les sessions futures generades amb el patró antic
            await _scheduleResource.DeleteFutureSessionsByScheduleAsync(schedule.Id);

            // 3. Regenera les sessions futures amb el nou patró (des d'avui)
            var fresh = await _scheduleResource.GetScheduleByIdAsync(schedule.Id);
            if (fresh == null) return;

            var range = await _scheduleResource.GetAssignmentDateRangeAsync(fresh.AssignmentId);
            if (range == null) return;

            var (startDate, endDate) = range.Value;
            var effectiveStart = DateTime.Today > startDate ? DateTime.Today : startDate;

            var sessions = GenerateSessions(fresh, effectiveStart, endDate);
            if (sessions.Any())
                await _sessionResource.CreateManyAsync(sessions);
        }

        public async Task DeleteScheduleAsync(Guid scheduleId)
        {
            await _scheduleResource.DeleteScheduleAsync(scheduleId);
        }

        // Mètode únic de generació: recorre les dates entre fromDate i toDate
        // i crea una sessió per cada dia que coincideix amb el day_of_week del schedule
        private List<Session> GenerateSessions(
            AssignmentSchedule schedule, DateTime fromDate, DateTime toDate)
        {
            var sessions = new List<Session>();
            var current = fromDate.Date;
            var end = toDate.Date;

            while (current <= end)
            {
                var dotNetDay = (int)current.DayOfWeek;
                var ourDay = dotNetDay == 0 ? 6 : dotNetDay - 1;

                if (ourDay == schedule.DayOfWeek)
                {
                    sessions.Add(new Session
                    {
                        Id = Guid.NewGuid(),
                        AssignmentId = schedule.AssignmentId,
                        ScheduleId = schedule.Id,
                        SessionDate = current,
                        StartTime = schedule.StartTime,
                        EndTime = schedule.EndTime,
                        Building = schedule.Building,
                        Floor = schedule.Floor,
                        Unit = schedule.Unit,
                        ClinicalTutorId = schedule.ClinicalTutorId,
                        Status = SessionStatus.Scheduled,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                current = current.AddDays(1);
            }

            return sessions;
        }
    }
}