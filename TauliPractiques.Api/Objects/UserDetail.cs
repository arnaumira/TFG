namespace TauliPractiques.Api.Objects
{
    public class UserDetail
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;

        // Student
        public string? University { get; set; }
        public string? Niu { get; set; }
        public int? CurrentCourse { get; set; }
        public string? Degree { get; set; }

        // ClinicalTutor
        public string? Specialty { get; set; }
        public string? LicenseNumber { get; set; }

        // AcademicTutor
        public string? Faculty { get; set; }
        public string? OfficeLocation { get; set; }

        // Compartit tutors
        public string? Department { get; set; }

        // Assignació
        public Guid? AssignmentId { get; set; }
        public string? Area { get; set; }
        public string? Unit { get; set; }
        public string? Building { get; set; }
        public string? Floor { get; set; }
        public string? ClinicalTutorName { get; set; }
        public string? AcademicTutorName { get; set; }
        public DateTime? AssignmentStartDate { get; set; }
        public DateTime? AssignmentEndDate { get; set; }

        // Per tutors: nombre d'alumnes
        public int StudentCount { get; set; }
    }
}