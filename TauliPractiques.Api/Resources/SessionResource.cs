using Dapper;
using System.Data;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Resources
{
    public class SessionResource
    {
        private readonly IDbConnection _db;

        public SessionResource(IDbConnection db)
        {
            DefaultTypeMap.MatchNamesWithUnderscores = true;
            _db = db;
        }

        public async Task CreateManyAsync(IEnumerable<Session> sessions)
        {
            const string sql = @"
                INSERT INTO sessions
                    (id, assignment_id, schedule_id, session_date, start_time, end_time,
                     building, floor, unit, clinical_tutor_id, status, notes, created_at)
                VALUES
                    (@Id, @AssignmentId, @ScheduleId, @SessionDate, @StartTime, @EndTime,
                     @Building, @Floor, @Unit, @ClinicalTutorId, @Status, @Notes, @CreatedAt);";

            await _db.ExecuteAsync(sql, sessions);
        }

        public async Task<IEnumerable<SessionDetail>> GetSessionsByAssignmentAsync(Guid assignmentId)
        {
            const string sql = @"
                SELECT
                    s.id,
                    s.session_date,
                    s.start_time,
                    s.end_time,
                    COALESCE(s.building, a.building)   AS building,
                    COALESCE(s.floor,    a.floor)       AS floor,
                    COALESCE(s.unit,     a.unit)        AS unit,
                    COALESCE(ct.full_name, act.full_name) AS clinical_tutor_name,
                    s.status,
                    s.notes
                FROM sessions s
                JOIN assignments a ON a.id = s.assignment_id
                LEFT JOIN clinical_tutors ct  ON ct.id  = s.clinical_tutor_id
                LEFT JOIN clinical_tutors act ON act.id = a.clinical_tutor_id
                WHERE s.assignment_id = @AssignmentId
                ORDER BY s.session_date;";

            return await _db.QueryAsync<SessionDetail>(sql, new { AssignmentId = assignmentId });
        }

        public async Task<IEnumerable<SessionDetail>> GetSessionsByStudentAndMonthAsync(
            Guid assignmentId, int year, int month)
        {
            const string sql = @"
                SELECT
                    s.id,
                    s.session_date,
                    s.start_time,
                    s.end_time,
                    COALESCE(s.building, a.building)      AS building,
                    COALESCE(s.floor,    a.floor)          AS floor,
                    COALESCE(s.unit,     a.unit)           AS unit,
                    COALESCE(ct.full_name, act.full_name)  AS clinical_tutor_name,
                    s.status,
                    s.notes
                FROM sessions s
                JOIN assignments a ON a.id = s.assignment_id
                LEFT JOIN clinical_tutors ct  ON ct.id  = s.clinical_tutor_id
                LEFT JOIN clinical_tutors act ON act.id = a.clinical_tutor_id
                WHERE s.assignment_id = @AssignmentId
                  AND EXTRACT(YEAR  FROM s.session_date) = @Year
                  AND EXTRACT(MONTH FROM s.session_date) = @Month
                  AND s.status != 'cancelled'
                ORDER BY s.session_date;";

            return await _db.QueryAsync<SessionDetail>(sql, new { AssignmentId = assignmentId, Year = year, Month = month });
        }

        public async Task<SessionDetail?> GetSessionByDateAsync(Guid assignmentId, DateTime date)
        {
            const string sql = @"
        SELECT
            s.id,
            s.session_date,
            s.start_time,
            s.end_time,
            COALESCE(s.building, a.building)      AS building,
            COALESCE(s.floor,    a.floor)          AS floor,
            COALESCE(s.unit,     a.unit)           AS unit,
            COALESCE(ct.full_name, act.full_name)  AS clinical_tutor_name,
            s.status,
            s.notes,
            CASE
                WHEN att.id IS NOT NULL THEN 'present'
                WHEN s.session_date < CURRENT_DATE THEN 'absent'
                ELSE 'pending'
            END AS attendance_status
        FROM sessions s
        JOIN assignments a ON a.id = s.assignment_id
        LEFT JOIN clinical_tutors ct  ON ct.id  = s.clinical_tutor_id
        LEFT JOIN clinical_tutors act ON act.id = a.clinical_tutor_id
        LEFT JOIN attendances att
            ON att.session_id = s.id AND att.student_id = a.student_id
        WHERE s.assignment_id = @AssignmentId
          AND s.session_date  = @Date;";

            return await _db.QueryFirstOrDefaultAsync<SessionDetail>(sql,
                new { AssignmentId = assignmentId, Date = date.Date });
        }

        public async Task UpdateSessionAsync(Guid sessionId, string? building, string? floor,
            string? unit, Guid? clinicalTutorId, TimeSpan? startTime, TimeSpan? endTime, string? notes)
        {
            const string sql = @"
                UPDATE sessions SET
                    building           = COALESCE(@Building, building),
                    floor              = COALESCE(@Floor, floor),
                    unit               = COALESCE(@Unit, unit),
                    clinical_tutor_id  = COALESCE(@ClinicalTutorId, clinical_tutor_id),
                    start_time         = COALESCE(@StartTime, start_time),
                    end_time           = COALESCE(@EndTime, end_time),
                    notes              = COALESCE(@Notes, notes),
                    status             = 'modified'
                WHERE id = @SessionId;";

            await _db.ExecuteAsync(sql, new
            {
                SessionId = sessionId,
                Building = building,
                Floor = floor,
                Unit = unit,
                ClinicalTutorId = clinicalTutorId,
                StartTime = startTime,
                EndTime = endTime,
                Notes = notes
            });
        }

        public async Task<IEnumerable<SessionDetail>> GetSessionsByMonthForCoordinatorAsync(int year, int month, Guid? studentId, Guid? clinicalTutorId)
        {
            const string sql = @"
                SELECT
                    se.id,
                    se.session_date,
                    se.start_time,
                    se.end_time,
                    COALESCE(se.unit, a.unit) AS unit,
                    s.id AS student_id,
                    s.full_name AS student_name,
                    CASE
                        WHEN at.id IS NOT NULL THEN 'present'
                        WHEN se.session_date < CURRENT_DATE THEN 'absent'
                        ELSE 'pending'
                    END AS attendance_status
                FROM sessions se
                JOIN assignments a ON a.id = se.assignment_id
                JOIN students s ON s.id = a.student_id
                LEFT JOIN attendances at ON at.session_id = se.id
                WHERE se.status != 'cancelled'
                  AND EXTRACT(YEAR  FROM se.session_date) = @Year
                  AND EXTRACT(MONTH FROM se.session_date) = @Month
                  AND (@StudentId IS NULL OR a.student_id = @StudentId)
                  AND (@ClinicalTutorId IS NULL OR a.clinical_tutor_id = @ClinicalTutorId)
                ORDER BY se.session_date, s.full_name;";

            return await _db.QueryAsync<SessionDetail>(sql, new
            {
                Year = year,
                Month = month,
                StudentId = studentId,
                ClinicalTutorId = clinicalTutorId
            });
        }


    }
}