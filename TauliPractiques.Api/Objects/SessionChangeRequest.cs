namespace TauliPractiques.Api.Objects
{
    public class SessionChangeRequest
    {
        public Guid Id { get; set; }
        public Guid SessionId { get; set; }
        public Guid StudentId { get; set; }
        public DateTime ProposedDate { get; set; }
        public TimeSpan ProposedStart { get; set; }
        public TimeSpan ProposedEnd { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "pending";
        public DateTime CreatedAt { get; set; }
    }

    public class SessionChangeRequestDetail
    {
        public Guid Id { get; set; }
        public Guid SessionId { get; set; }
        public DateTime OriginalDate { get; set; }
        public TimeSpan OriginalStart { get; set; }
        public TimeSpan OriginalEnd { get; set; }
        public DateTime ProposedDate { get; set; }
        public TimeSpan ProposedStart { get; set; }
        public TimeSpan ProposedEnd { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}