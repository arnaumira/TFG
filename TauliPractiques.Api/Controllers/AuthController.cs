using Microsoft.AspNetCore.Mvc;
using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Services;

namespace TauliPractiques.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email i contrasenya obligatoris." });

            var response = await _authService.LoginAsync(request);

            if (response == null)
                return Unauthorized(new { message = "Credencials incorrectes." });

            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegistrationRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email i contrasenya obligatoris." });

            User newUser = request.Role switch
            {
                Student.RoleName => new Student
                {
                    Email = request.Email,
                    PasswordHash = request.Password,
                    FullName = request.FullName,
                    University = request.University ?? "Universitat Autònoma de Barcelona",
                    Niu = request.Niu,
                    EnrollmentYear = request.EnrollmentYear,
                    CurrentCourse = request.CurrentCourse,
                    Degree = request.Degree ?? "Grau en Infermeria"
                },
                ClinicalTutor.RoleName => new ClinicalTutor
                {
                    Email = request.Email,
                    PasswordHash = request.Password,
                    FullName = request.FullName,
                    Specialty = request.Specialty,
                    Department = request.Department,
                    LicenseNumber = request.LicenseNumber
                },
                AcademicTutor.RoleName => new AcademicTutor
                {
                    Email = request.Email,
                    PasswordHash = request.Password,
                    FullName = request.FullName,
                    Faculty = request.Faculty,
                    Department = request.Department,
                    OfficeLocation = request.OfficeLocation
                },
                _ => new Coordinator
                {
                    Email = request.Email,
                    PasswordHash = request.Password,
                    FullName = request.FullName
                }
            };

            var response = await _authService.RegisterAsync(newUser);

            if (response == null)
                return Conflict(new { message = "Aquest correu ja existeix." });

            return Ok(response);
        }
    }
}