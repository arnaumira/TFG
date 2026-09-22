namespace TauliPractiques.Api.Objects
{
    public class Evaluation
    {
        public Guid Id { get; set; }
        public Guid AssignmentId { get; set; }
        public Guid RubricId { get; set; }
        public Guid EvaluatedBy { get; set; }
        public DateTime EvaluatedAt { get; set; }
        public string? Comments { get; set; }
        public List<EvaluationScore> Scores { get; set; } = new();
    }
}