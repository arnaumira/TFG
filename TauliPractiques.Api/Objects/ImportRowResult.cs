namespace TauliPractiques.Api.Objects
{
    public class ImportRowResult
    {
        public int RowNumber { get; set; }
        public string StudentEmail { get; set; } = string.Empty;
        public string ClinicalTutorEmail { get; set; } = string.Empty;
        public string AcademicTutorEmail { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Building { get; set; } = string.Empty;
        public string Floor { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string AcademicYear { get; set; } = string.Empty;

        // Resolts
        public Guid? StudentId { get; set; }
        public Guid? ClinicalTutorId { get; set; }
        public Guid? AcademicTutorId { get; set; }
        public string? StudentName { get; set; }
        public string? ClinicalTutorName { get; set; }
        public string? AcademicTutorName { get; set; }

        public bool IsValid { get; set; }
        public string? Error { get; set; }
    }

    public class ImportAssignmentDto
    {
        public Guid StudentId { get; set; }
        public Guid ClinicalTutorId { get; set; }
        public Guid AcademicTutorId { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Building { get; set; } = string.Empty;
        public string Floor { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
