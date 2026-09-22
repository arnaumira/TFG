namespace TauliPractiques.Api.Objects
{
    public class ClinicalTutor : User
    {
        public const string RoleName = "clinical_tutor";

        public string? Specialty { get; set; }
        public string? LicenseNumber { get; set; }
        public string? Department { get; set; }
    }
}