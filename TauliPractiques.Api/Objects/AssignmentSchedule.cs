namespace TauliPractiques.Api.Objects
{
    public class AssignmentSchedule
    {
        public Guid Id { get; set; }
        public Guid AssignmentId { get; set; }
        public int DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? Building { get; set; }
        public string? Floor { get; set; }
        public string? Unit { get; set; }
        public Guid? ClinicalTutorId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}