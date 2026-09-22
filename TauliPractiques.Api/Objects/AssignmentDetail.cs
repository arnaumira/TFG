namespace TauliPractiques.Api.Objects
{
    public class AssignmentDetail
    {
        public Guid Id { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Building { get; set; } = string.Empty;
        public string Floor { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ClinicalTutorName { get; set; } = string.Empty;
        public string AcademicTutorName { get; set; } = string.Empty;
        public string? StudentName { get; set; }
    }
}