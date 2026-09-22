namespace TauliPractiques.Api.Objects
{
    public class Rubric
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid CreatedBy { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<Criterion> Criteria { get; set; } = new();
        public int CriteriaCount { get; set; }

    }
}