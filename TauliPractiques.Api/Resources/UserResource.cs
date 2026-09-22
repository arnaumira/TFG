using Dapper;
using System.Data;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Resources
{
    public class UserResource
    {
        private readonly IDbConnection _db;

        public UserResource(IDbConnection db)
        {
            _db = db;
            DefaultTypeMap.MatchNamesWithUnderscores = true;
        }

        public async Task<User?> FindByEmailAsync(string email)
        {
            var student = await _db.QueryFirstOrDefaultAsync<Student>(
                "SELECT * FROM students WHERE email = @Email AND is_active = TRUE",
                new { Email = email });
            if (student != null) return student;

            var clinicalTutor = await _db.QueryFirstOrDefaultAsync<ClinicalTutor>(
                "SELECT * FROM clinical_tutors WHERE email = @Email AND is_active = TRUE",
                new { Email = email });
            if (clinicalTutor != null) return clinicalTutor;

            var academicTutor = await _db.QueryFirstOrDefaultAsync<AcademicTutor>(
                "SELECT * FROM academic_tutors WHERE email = @Email AND is_active = TRUE",
                new { Email = email });
            if (academicTutor != null) return academicTutor;

            return await _db.QueryFirstOrDefaultAsync<Coordinator>(
                "SELECT * FROM coordinators WHERE email = @Email AND is_active = TRUE",
                new { Email = email });
        }

        public async Task RegisterStudentAsync(Student student)
        {
            await _db.ExecuteAsync(@"
                INSERT INTO students
                    (id, email, password_hash, full_name, is_active, created_at,
                     university, niu, enrollment_year, current_course, degree)
                VALUES
                    (@Id, @Email, @PasswordHash, @FullName, @IsActive, @CreatedAt,
                     @University, @Niu, @EnrollmentYear, @CurrentCourse, @Degree)",
                student);
        }

        public async Task RegisterClinicalTutorAsync(ClinicalTutor tutor)
        {
            await _db.ExecuteAsync(@"
        INSERT INTO clinical_tutors
            (id, email, password_hash, full_name, is_active, created_at,
             specialty, license_number, department)
        VALUES
            (@Id, @Email, @PasswordHash, @FullName, @IsActive, @CreatedAt,
             @Specialty, @LicenseNumber, @Department)",
                tutor);
        }

        public async Task RegisterAcademicTutorAsync(AcademicTutor tutor)
        {
            await _db.ExecuteAsync(@"
        INSERT INTO academic_tutors
            (id, email, password_hash, full_name, is_active, created_at,
             faculty, department, office_location)
        VALUES
            (@Id, @Email, @PasswordHash, @FullName, @IsActive, @CreatedAt,
             @Faculty, @Department, @OfficeLocation)",
                tutor);
        }

        public async Task RegisterCoordinatorAsync(Coordinator coordinator)
        {
            await _db.ExecuteAsync(@"
        INSERT INTO coordinators
            (id, email, password_hash, full_name, is_active, created_at,
             office, phone)
        VALUES
            (@Id, @Email, @PasswordHash, @FullName, @IsActive, @CreatedAt,
             @Office, @Phone)",
                coordinator);
        }

        public async Task<Student?> GetStudentByIdAsync(Guid id)
        {
            return await _db.QueryFirstOrDefaultAsync<Student>(
                "SELECT * FROM students WHERE id = @Id AND is_active = TRUE",
                new { Id = id });
        }

        public async Task<ClinicalTutor?> GetClinicalTutorByIdAsync(Guid id)
        {
            return await _db.QueryFirstOrDefaultAsync<ClinicalTutor>(
                "SELECT * FROM clinical_tutors WHERE id = @Id AND is_active = TRUE",
                new { Id = id });
        }

        public async Task<AcademicTutor?> GetAcademicTutorByIdAsync(Guid id)
        {
            return await _db.QueryFirstOrDefaultAsync<AcademicTutor>(
                "SELECT * FROM academic_tutors WHERE id = @Id AND is_active = TRUE",
                new { Id = id });
        }
    }
}