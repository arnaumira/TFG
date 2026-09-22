using Dapper;
using System.Data;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Resources
{
    public class AssignmentScheduleResource
    {
        private readonly IDbConnection _db;

        public AssignmentScheduleResource(IDbConnection db)
        {
            DefaultTypeMap.MatchNamesWithUnderscores = true;
            _db = db;
        }

        public async Task<AssignmentSchedule> CreateScheduleAsync(AssignmentSchedule schedule)
        {
            const string sql = @"
                INSERT INTO assignment_schedules
                    (id, assignment_id, day_of_week, start_time, end_time,
                     building, floor, unit, clinical_tutor_id, created_at)
                VALUES
                    (@Id, @AssignmentId, @DayOfWeek, @StartTime, @EndTime,
                     @Building, @Floor, @Unit, @ClinicalTutorId, @CreatedAt)
                RETURNING *;";

            return await _db.QueryFirstAsync<AssignmentSchedule>(sql, schedule);
        }

        public async Task<IEnumerable<AssignmentSchedule>> GetByAssignmentAsync(Guid assignmentId)
        {
            const string sql = @"
                SELECT * FROM assignment_schedules
                WHERE assignment_id = @AssignmentId
                ORDER BY day_of_week;";

            return await _db.QueryAsync<AssignmentSchedule>(sql, new { AssignmentId = assignmentId });
        }


        public async Task<AssignmentSchedule?> GetScheduleByIdAsync(Guid scheduleId)
        {
            return await _db.QueryFirstOrDefaultAsync<AssignmentSchedule>(
                "SELECT * FROM assignment_schedules WHERE id = @Id;",
                new { Id = scheduleId });
        }

        public async Task UpdateScheduleAsync(AssignmentSchedule schedule)
        {
            await _db.ExecuteAsync(@"
        UPDATE assignment_schedules SET
            day_of_week = @DayOfWeek,
            start_time  = @StartTime,
            end_time    = @EndTime,
            building    = @Building,
            floor       = @Floor,
            unit        = @Unit
        WHERE id = @Id;", schedule);
        }

        public async Task DeleteFutureSessionsByScheduleAsync(Guid scheduleId)
        {
            // 1. Esborra les sol·licituds de canvi de les sessions futures d'aquest schedule
            await _db.ExecuteAsync(@"
        DELETE FROM session_change_requests
        WHERE session_id IN (
            SELECT id FROM sessions
            WHERE schedule_id = @Id AND session_date >= CURRENT_DATE
        );",
                new { Id = scheduleId });

            // 2. Esborra les sessions futures
            await _db.ExecuteAsync(@"
        DELETE FROM sessions
        WHERE schedule_id = @Id AND session_date >= CURRENT_DATE;",
                new { Id = scheduleId });
        }

        public async Task DeleteScheduleAsync(Guid scheduleId)
        {
            // 1. Esborra les sol·licituds de canvi de les sessions futures
            await _db.ExecuteAsync(@"
        DELETE FROM session_change_requests
        WHERE session_id IN (
            SELECT id FROM sessions
            WHERE schedule_id = @Id AND session_date >= CURRENT_DATE
        );",
                new { Id = scheduleId });

            // 2. Esborra les sessions futures
            await _db.ExecuteAsync(@"
        DELETE FROM sessions
        WHERE schedule_id = @Id AND session_date >= CURRENT_DATE;",
                new { Id = scheduleId });

            // 3. Desvincula les sessions passades
            await _db.ExecuteAsync(@"
        UPDATE sessions SET schedule_id = NULL WHERE schedule_id = @Id;",
                new { Id = scheduleId });

            // 4. Esborra el schedule
            await _db.ExecuteAsync(@"
        DELETE FROM assignment_schedules WHERE id = @Id;",
                new { Id = scheduleId });
        }

        public async Task<(DateTime StartDate, DateTime EndDate)?> GetAssignmentDateRangeAsync(
            Guid assignmentId)
        {
            var row = await _db.QueryFirstOrDefaultAsync<dynamic>(
                "SELECT start_date, end_date FROM assignments WHERE id = @Id;",
                new { Id = assignmentId });

            if (row == null) return null;
            return ((DateTime)row.start_date, (DateTime)row.end_date);
        }
    }
}