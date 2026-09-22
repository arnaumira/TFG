namespace TauliPractiques.Api.Objects
{
    public class RubricImportResult
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<RubricImportCriterion> Criteria { get; set; } = new();
        public bool IsValid { get; set; }
        public string? Error { get; set; }
    }

    public class RubricImportCriterion
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int MaxScore { get; set; }
    }
}