namespace TauliPractiques.Api.Objects
{
    public class Session
    {
        public Guid Id { get; set; }
        public Guid AssignmentId { get; set; }
        public Guid? ScheduleId { get; set; }
        public DateTime SessionDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? Building { get; set; }
        public string? Floor { get; set; }
        public string? Unit { get; set; }
        public Guid? ClinicalTutorId { get; set; }
        public string Status { get; set; } = "scheduled";
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public static class SessionStatus
    {
        public const string Scheduled = "scheduled";
        public const string Modified = "modified";
        public const string Cancelled = "cancelled";
        public const string Completed = "completed";
    }
}