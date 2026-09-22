namespace TauliPractiques.Api.Objects
{
    public class Announcement
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Target { get; set; } = "all";
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AnnouncementDetail
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
    }
}