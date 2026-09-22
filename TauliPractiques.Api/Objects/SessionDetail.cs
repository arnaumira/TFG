namespace TauliPractiques.Api.Objects
{
    public class SessionDetail
    {
        public Guid Id { get; set; }
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Building { get; set; } = string.Empty;
        public string Floor { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string ClinicalTutorName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? StudentName { get; set; }
        public string? AttendanceStatus { get; set; }
    }
}