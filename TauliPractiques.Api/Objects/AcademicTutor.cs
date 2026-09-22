namespace TauliPractiques.Api.Objects
{
    public class AcademicTutor : User
    {
        public const string RoleName = "academic_tutor";

        public string? Faculty { get; set; }
        public string? Department { get; set; }
        public string? OfficeLocation { get; set; }
    }
}