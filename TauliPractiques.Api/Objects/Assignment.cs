namespace TauliPractiques.Api.Objects
{
    public class Assignment
    {
        public Guid Id { get; set; }
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
        public DateTime CreatedAt { get; set; }
    }
}