namespace TauliPractiques.Api.Objects
{
    public class Coordinator : User
    {
        public const string RoleName = "coordinator";

        public string? Office { get; set; }
        public string? Phone { get; set; }
    }
}