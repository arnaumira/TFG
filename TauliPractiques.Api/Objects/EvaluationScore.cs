namespace TauliPractiques.Api.Objects
{
    public class EvaluationScore
    {
        public Guid Id { get; set; }
        public Guid EvaluationId { get; set; }
        public Guid CriteriaId { get; set; }
        public int Score { get; set; }
    }
}