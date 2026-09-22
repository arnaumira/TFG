using Dapper;
using System.Data;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Resources
{
    public class SessionChangeRequestResource
    {
        private readonly IDbConnection _db;

        public SessionChangeRequestResource(IDbConnection db)
        {
            DefaultTypeMap.MatchNamesWithUnderscores = true;
            _db = db;
        }

        public async Task CreateAsync(SessionChangeRequest request)
        {
            const string sql = @"
                INSERT INTO session_change_requests
                    (session_id, student_id, proposed_date, proposed_start,
                     proposed_end, reason, status, created_at)
                VALUES
                    (@SessionId, @StudentId, @ProposedDate, @ProposedStart,
                     @ProposedEnd, @Reason, @Status, @CreatedAt);";

            await _db.ExecuteAsync(sql, request);
        }

        public async Task<IEnumerable<SessionChangeRequestDetail>> GetByAssignmentAsync(
            Guid assignmentId)
        {
            const string sql = @"
                SELECT
                    scr.id,
                    scr.session_id,
                    se.session_date AS original_date,
                    se.start_time AS original_start,
                    se.end_time AS original_end,
                    scr.proposed_date,
                    scr.proposed_start,
                    scr.proposed_end,
                    scr.reason,
                    scr.status,
                    s.full_name AS student_name,
                    scr.created_at
                FROM session_change_requests scr
                JOIN sessions se ON se.id = scr.session_id
                JOIN students s ON s.id = scr.student_id
                WHERE se.assignment_id = @AssignmentId
                ORDER BY scr.created_at DESC;";

            return await _db.QueryAsync<SessionChangeRequestDetail>(sql,
                new { AssignmentId = assignmentId });
        }

        public async Task<IEnumerable<DateTime>> GetWorkedDatesAsync(Guid assignmentId)
        {
            const string sql = @"
                SELECT session_date FROM sessions
                WHERE assignment_id = @AssignmentId
                AND status != 'cancelled'
                ORDER BY session_date;";

            return await _db.QueryAsync<DateTime>(sql, new { AssignmentId = assignmentId });
        }

        public async Task<IEnumerable<SessionChangeRequestDetail>> GetPendingByAcademicTutorAsync(
            Guid academicTutorId)
        {
            const string sql = @"
                SELECT
                    scr.id,
                    scr.session_id,
                    se.session_date AS original_date,
                    se.start_time AS original_start,
                    se.end_time AS original_end,
                    scr.proposed_date,
                    scr.proposed_start,
                    scr.proposed_end,
                    scr.reason,
                    scr.status,
                    s.full_name AS student_name,
                    scr.created_at
                FROM session_change_requests scr
                JOIN sessions se ON se.id = scr.session_id
                JOIN assignments a ON a.id = se.assignment_id
                JOIN students s ON s.id = scr.student_id
                WHERE a.academic_tutor_id = @AcademicTutorId
                ORDER BY scr.created_at DESC;";

            return await _db.QueryAsync<SessionChangeRequestDetail>(sql,
                new { AcademicTutorId = academicTutorId });
        }

        public async Task UpdateStatusAsync(Guid requestId, string status)
        {
            await _db.ExecuteAsync(@"
                UPDATE session_change_requests
                SET status = @Status
                WHERE id = @Id;",
                new { Id = requestId, Status = status });
        }

        public async Task ApproveAndUpdateSessionAsync(Guid requestId)
        {
            const string sql = @"
                SELECT
                    scr.session_id,
                    scr.proposed_date,
                    scr.proposed_start,
                    scr.proposed_end
                FROM session_change_requests scr
                WHERE scr.id = @RequestId;";

            var request = await _db.QueryFirstOrDefaultAsync<dynamic>(sql,
                new { RequestId = requestId });

            if (request == null) return;

            await _db.ExecuteAsync(@"
                UPDATE sessions SET
                    session_date  = @ProposedDate,
                    start_time    = @ProposedStart,
                    end_time      = @ProposedEnd,
                    status        = 'modified'
                WHERE id = @SessionId;",
                new
                {
                    SessionId = (Guid)request.session_id,
                    ProposedDate = (DateTime)request.proposed_date,
                    ProposedStart = (TimeSpan)request.proposed_start,
                    ProposedEnd = (TimeSpan)request.proposed_end
                });

            await _db.ExecuteAsync(@"
                UPDATE session_change_requests SET status = 'approved'
                WHERE id = @Id;",
                new { Id = requestId });
        }
    }
}