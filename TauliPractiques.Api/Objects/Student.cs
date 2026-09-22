namespace TauliPractiques.Api.Objects
{
    public class Student : User
    {
        public const string RoleName = "student";
        public string University { get; set; } = "Universitat Autònoma de Barcelona";
        public string? Niu { get; set; }
        public int? EnrollmentYear { get; set; }
        public int? CurrentCourse { get; set; }
        public string Degree { get; set; } = "Grau en Infermeria";
    }
}