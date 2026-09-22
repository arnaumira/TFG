namespace TauliPractiques.Api.Objects
{
    public class StudentSummary
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int? CurrentCourse { get; set; }
        public string University { get; set; } = string.Empty;
        public Guid AssignmentId { get; set; }
        public string Area { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
    }

    public class TodayAttendance
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public Guid SessionId { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string AttendanceStatus { get; set; } = string.Empty;
    }

    
}