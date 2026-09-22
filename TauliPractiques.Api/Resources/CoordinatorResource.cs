using Dapper;
using System.Data;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Resources
{
    public class CoordinatorResource
    {
        private readonly IDbConnection _db;

        public CoordinatorResource(IDbConnection db)
        {
            DefaultTypeMap.MatchNamesWithUnderscores = true;
            _db = db;
        }

        public async Task<IEnumerable<StudentSummary>> GetAllStudentsAsync()
        {
            const string sql = @"
                SELECT
                    s.id,
                    s.full_name,
                    s.email,
                    s.current_course,
                    s.university,
                    s.degree,
                    a.id AS assignment_id,
                    a.area,
                    a.unit
                FROM students s
                LEFT JOIN assignments a ON a.student_id = s.id
                WHERE s.is_active = TRUE
                ORDER BY s.full_name;";

            return await _db.QueryAsync<StudentSummary>(sql);
        }

        public async Task<IEnumerable<ClinicalTutor>> GetAllClinicalTutorsAsync()
        {
            return await _db.QueryAsync<ClinicalTutor>(
                "SELECT * FROM clinical_tutors WHERE is_active = TRUE ORDER BY full_name;");
        }

        public async Task<IEnumerable<AcademicTutor>> GetAllAcademicTutorsAsync()
        {
            return await _db.QueryAsync<AcademicTutor>(
                "SELECT * FROM academic_tutors WHERE is_active = TRUE ORDER BY full_name;");
        }

        public async Task<IEnumerable<UserDetail>> GetAllUsersAsync()
        {
            var users = new List<UserDetail>();

            const string studentSql = @"
    SELECT
        s.id, s.full_name, s.email,
        'student' AS role,
        s.university, s.niu, s.current_course, s.degree,
        a.id AS assignment_id,
        a.area, a.unit, a.building, a.floor,
        a.start_date AS assignment_start_date,
        a.end_date AS assignment_end_date,
        ct.full_name AS clinical_tutor_name,
        at.full_name AS academic_tutor_name
    FROM students s
    LEFT JOIN LATERAL (
        SELECT * FROM assignments
        WHERE student_id = s.id
        ORDER BY start_date DESC
        LIMIT 1
    ) a ON true
    LEFT JOIN clinical_tutors ct ON ct.id = a.clinical_tutor_id
    LEFT JOIN academic_tutors at ON at.id = a.academic_tutor_id
    WHERE s.is_active = TRUE
    ORDER BY s.full_name;";

            var students = await _db.QueryAsync<UserDetail>(studentSql);
            users.AddRange(students);

            const string clinicalSql = @"
        SELECT
            ct.id, ct.full_name, ct.email,
            'clinical_tutor' AS role,
            ct.specialty, ct.license_number, ct.department,
            COUNT(DISTINCT a.student_id) AS student_count
        FROM clinical_tutors ct
        LEFT JOIN assignments a ON a.clinical_tutor_id = ct.id
        WHERE ct.is_active = TRUE
        GROUP BY ct.id, ct.full_name, ct.email, ct.specialty, ct.license_number, ct.department
        ORDER BY ct.full_name;";

            var clinicalTutors = await _db.QueryAsync<UserDetail>(clinicalSql);
            users.AddRange(clinicalTutors);

            const string academicSql = @"
        SELECT
            at.id, at.full_name, at.email,
            'academic_tutor' AS role,
            at.faculty, at.department, at.office_location,
            COUNT(DISTINCT a.student_id) AS student_count
        FROM academic_tutors at
        LEFT JOIN assignments a ON a.academic_tutor_id = at.id
        WHERE at.is_active = TRUE
        GROUP BY at.id, at.full_name, at.email, at.faculty, at.department, at.office_location
        ORDER BY at.full_name;";

            var academicTutors = await _db.QueryAsync<UserDetail>(academicSql);
            users.AddRange(academicTutors);

            return users;
        }

        public async Task<CoordinatorStats> GetStatsAsync()
        {
            const string sql = @"
            SELECT
                (SELECT COUNT(*) FROM students WHERE is_active = TRUE) AS student_count,
                (SELECT COUNT(*) FROM clinical_tutors WHERE is_active = TRUE) AS clinical_tutor_count,
                (SELECT COUNT(*) FROM academic_tutors WHERE is_active = TRUE) AS academic_tutor_count,
                (SELECT COUNT(*) FROM assignments) AS assignment_count,
                (SELECT COUNT(*) FROM rubrics WHERE is_active = TRUE) AS rubric_count;";

            return await _db.QueryFirstAsync<CoordinatorStats>(sql);
        }
    }
}