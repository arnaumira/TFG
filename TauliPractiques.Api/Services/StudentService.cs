using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class StudentService
    {
        private readonly UserResource _userResource;

        public StudentService(UserResource userResource)
        {
            _userResource = userResource;
        }

        public async Task<Student?> GetMyProfileAsync(Guid studentId)
        {
            return await _userResource.GetStudentByIdAsync(studentId);
        }
    }
}