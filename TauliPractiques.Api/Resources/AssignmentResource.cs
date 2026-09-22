using Dapper;
using System.Data;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Resources
{
    public class AssignmentResource
    {
        private readonly IDbConnection _db;

        public AssignmentResource(IDbConnection db)
        {
            DefaultTypeMap.MatchNamesWithUnderscores = true;
            _db = db;
        }

        public async Task<AssignmentDetail?> GetCurrentAssignmentByStudentAsync(Guid studentId)
        {
            const string sql = @"
                    SELECT
                        a.id,
                        a.academic_year,
                        a.area,
                        a.building,
                        a.floor,
                        a.unit,
                        a.start_date,
                        a.end_date,
                        ct.full_name AS clinical_tutor_name,
                        at.full_name AS academic_tutor_name
                    FROM assignments a
                    JOIN clinical_tutors ct ON ct.id = a.clinical_tutor_id
                    JOIN academic_tutors at ON at.id = a.academic_tutor_id
                    WHERE a.student_id = @StudentId
                    ORDER BY a.start_date DESC
                    LIMIT 1;";

            return await _db.QueryFirstOrDefaultAsync<AssignmentDetail>(sql, new { StudentId = studentId });
        }

        public async Task<Assignment?> GetByIdAsync(Guid id)
        {
            return await _db.QueryFirstOrDefaultAsync<Assignment>(
                "SELECT * FROM assignments WHERE id = @Id",
                new { Id = id });
        }

        public async Task<IEnumerable<AssignmentDetail>> GetAllAssignmentsAsync()
        {
            const string sql = @"
                SELECT
                    a.id,
                    a.academic_year,
                    a.area,
                    a.building,
                    a.floor,
                    a.unit,
                    a.start_date,
                    a.end_date,
                    s.full_name AS student_name,
                    ct.full_name AS clinical_tutor_name,
                    at.full_name AS academic_tutor_name
                FROM assignments a
                JOIN students s ON s.id = a.student_id
                JOIN clinical_tutors ct ON ct.id = a.clinical_tutor_id
                JOIN academic_tutors at ON at.id = a.academic_tutor_id
                ORDER BY a.start_date DESC;";

            return await _db.QueryAsync<AssignmentDetail>(sql);
        }

        public async Task<Assignment> CreateAssignmentAsync(Assignment assignment)
        {
            const string sql = @"
                INSERT INTO assignments
                    (id, student_id, clinical_tutor_id, academic_tutor_id,
                     academic_year, area, building, floor, unit,
                     start_date, end_date, created_at)
                VALUES
                    (@Id, @StudentId, @ClinicalTutorId, @AcademicTutorId,
                     @AcademicYear, @Area, @Building, @Floor, @Unit,
                     @StartDate, @EndDate, @CreatedAt)
                RETURNING *;";

            return await _db.QueryFirstAsync<Assignment>(sql, assignment);
        }

        public async Task<bool> StudentHasActiveAssignmentAsync(Guid studentId)
        {
            var count = await _db.ExecuteScalarAsync<int>(@"
        SELECT COUNT(*) FROM assignments
        WHERE student_id = @Id AND end_date >= CURRENT_DATE;",
                new { Id = studentId });
            return count > 0;
        }

        public async Task<bool> ClinicalTutorHasActiveAssignmentAsync(Guid clinicalTutorId)
        {
            var count = await _db.ExecuteScalarAsync<int>(@"
        SELECT COUNT(*) FROM assignments
        WHERE clinical_tutor_id = @Id AND end_date >= CURRENT_DATE;",
                new { Id = clinicalTutorId });
            return count > 0;
        }
    }
}