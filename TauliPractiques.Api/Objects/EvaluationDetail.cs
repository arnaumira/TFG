namespace TauliPractiques.Api.Objects
{
    public class EvaluationDetail
    {
        public Guid Id { get; set; }
        public Guid AssignmentId { get; set; }
        public string RubricTitle { get; set; } = string.Empty;
        public string EvaluatedByName { get; set; } = string.Empty;
        public DateTime EvaluatedAt { get; set; }
        public string? Comments { get; set; }
        public List<CriterionScore> Scores { get; set; } = new();
    }

    public class CriterionScore
    {
        public Guid CriteriaId { get; set; }
        public string CriterionName { get; set; } = string.Empty;
        public int Score { get; set; }
        public int MaxScore { get; set; }
    }
}