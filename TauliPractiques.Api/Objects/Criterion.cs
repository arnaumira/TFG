namespace TauliPractiques.Api.Objects
{
    public class Criterion
    {
        public Guid Id { get; set; }
        public Guid RubricId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int MaxScore { get; set; } = 10;
        public int OrderIndex { get; set; }
    }
}