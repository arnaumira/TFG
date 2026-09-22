using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class AuthService
    {
        private readonly UserResource _userResource;
        private readonly IConfiguration _config;

        public AuthService(UserResource userResource, IConfiguration config)
        {
            _userResource = userResource;
            _config = config;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _userResource.FindByEmailAsync(request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return null;

            var role = user switch
            {
                Student => Student.RoleName,
                ClinicalTutor => ClinicalTutor.RoleName,
                AcademicTutor => AcademicTutor.RoleName,
                Coordinator => Coordinator.RoleName,
                _ => "unknown"
            };

            return new LoginResponse
            {
                Token = GenerateJwt(user, role),
                FullName = user.FullName,
                Role = role,
                UserId = user.Id
            };
        }

        public async Task<LoginResponse?> RegisterAsync(User newUser)
        {
            var existing = await _userResource.FindByEmailAsync(newUser.Email);
            if (existing != null) return null;

            newUser.Id = Guid.NewGuid();
            newUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newUser.PasswordHash);
            newUser.IsActive = true;
            newUser.CreatedAt = DateTime.UtcNow;

            string role;

            switch (newUser)
            {
                case Student s:
                    await _userResource.RegisterStudentAsync(s);
                    role = Student.RoleName;
                    break;
                case ClinicalTutor ct:
                    await _userResource.RegisterClinicalTutorAsync(ct);
                    role = ClinicalTutor.RoleName;
                    break;
                case AcademicTutor at:
                    await _userResource.RegisterAcademicTutorAsync(at);
                    role = AcademicTutor.RoleName;
                    break;
                case Coordinator c:
                    await _userResource.RegisterCoordinatorAsync(c);
                    role = Coordinator.RoleName;
                    break;
                default:
                    return null;
            }

            return new LoginResponse
            {
                Token = GenerateJwt(newUser, role),
                FullName = newUser.FullName,
                Role = role,
                UserId = newUser.Id
            };
        }

        private string GenerateJwt(User user, string role)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, role),
                new Claim(ClaimTypes.Name, user.FullName)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}