namespace TauliPractiques.Api.Objects
{
    public class Attendance
    {
        public Guid Id { get; set; }
        public Guid SessionId { get; set; }
        public Guid StudentId { get; set; }
        public DateTime ScannedAt { get; set; }
        public string Method { get; set; } = "manual";
    }

    public static class AttendanceMethod
    {
        public const string Qr = "qr";
        public const string Manual = "manual";
    }
}