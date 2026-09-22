namespace TauliPractiques.Api.Objects
{
    public class RegistrationRequest
    {
        // Comuns
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;

        // Student
        public string? University { get; set; }
        public string? Niu { get; set; }
        public int? EnrollmentYear { get; set; }
        public int? CurrentCourse { get; set; }
        public string? Degree { get; set; }

        // ClinicalTutor
        public string? Specialty { get; set; }
        public string? LicenseNumber { get; set; }
        public string? Department { get; set; }

        // AcademicTutor
        public string? Faculty { get; set; }
        public string? OfficeLocation { get; set; }
    }
}