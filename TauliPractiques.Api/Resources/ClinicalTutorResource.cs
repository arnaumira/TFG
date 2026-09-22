using Dapper;
using System.Data;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Resources
{
    public class ClinicalTutorResource
    {
        private readonly IDbConnection _db;

        public ClinicalTutorResource(IDbConnection db)
        {
            DefaultTypeMap.MatchNamesWithUnderscores = true;
            _db = db;
        }

        public async Task<ClinicalTutor?> GetByIdAsync(Guid id)
        {
            return await _db.QueryFirstOrDefaultAsync<ClinicalTutor>(
                "SELECT * FROM clinical_tutors WHERE id = @Id AND is_active = TRUE",
                new { Id = id });
        }

        public async Task<IEnumerable<StudentSummary>> GetAssignedStudentsAsync(Guid clinicalTutorId)
        {
            const string sql = @"
                SELECT
                    s.id,
                    s.full_name,
                    s.email,
                    s.current_course,
                    s.university,
                    a.id AS assignment_id,
                    a.area,
                    a.unit
                FROM assignments a
                JOIN students s ON s.id = a.student_id
                WHERE a.clinical_tutor_id = @ClinicalTutorId
                ORDER BY s.full_name;";

            return await _db.QueryAsync<StudentSummary>(sql, new { ClinicalTutorId = clinicalTutorId });
        }

        public async Task<IEnumerable<TodayAttendance>> GetTodayAttendanceAsync(Guid clinicalTutorId)
        {
            const string sql = @"
                SELECT
                    s.id AS student_id,
                    s.full_name AS student_name,
                    se.id AS session_id,
                    se.start_time,
                    se.end_time,
                    CASE
                        WHEN at.id IS NOT NULL THEN 'present'
                        WHEN se.session_date < CURRENT_DATE THEN 'absent'
                        ELSE 'pending'
                    END AS attendance_status
                FROM assignments a
                JOIN students s ON s.id = a.student_id
                JOIN sessions se ON se.assignment_id = a.id
                    AND se.session_date = CURRENT_DATE
                    AND se.status != 'cancelled'
                LEFT JOIN attendances at ON at.session_id = se.id
                WHERE a.clinical_tutor_id = @ClinicalTutorId
                ORDER BY s.full_name;";

            return await _db.QueryAsync<TodayAttendance>(sql, new { ClinicalTutorId = clinicalTutorId });
        }

        public async Task<IEnumerable<SessionDetail>> GetSessionsByMonthAsync(
    Guid clinicalTutorId, int year, int month)
        {
            const string sql = @"
                SELECT
                    se.id,
                    se.session_date,
                    se.start_time,
                    se.end_time,
                    COALESCE(se.unit, a.unit) AS unit,
                    s.full_name AS student_name,
                    CASE
                        WHEN at.id IS NOT NULL THEN 'present'
                        WHEN se.session_date < CURRENT_DATE THEN 'absent'
                        ELSE 'pending'
                    END AS attendance_status
                FROM assignments a
                JOIN students s ON s.id = a.student_id
                JOIN sessions se ON se.assignment_id = a.id
                    AND se.status != 'cancelled'
                    AND EXTRACT(YEAR  FROM se.session_date) = @Year
                    AND EXTRACT(MONTH FROM se.session_date) = @Month
                LEFT JOIN attendances at ON at.session_id = se.id
                WHERE a.clinical_tutor_id = @ClinicalTutorId
                ORDER BY se.session_date, s.full_name;";

            return await _db.QueryAsync<SessionDetail>(sql,
                new { ClinicalTutorId = clinicalTutorId, Year = year, Month = month });
        }
    }
}