using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class RubricService
    {
        private readonly RubricResource _rubricResource;

        public RubricService(RubricResource rubricResource)
        {
            _rubricResource = rubricResource;
        }

        public async Task<IEnumerable<Rubric>> GetAllActiveAsync()
        {
            return await _rubricResource.GetAllActiveAsync();
        }

        public async Task<Rubric?> GetWithCriteriaAsync(Guid rubricId)
        {
            return await _rubricResource.GetWithCriteriaAsync(rubricId);
        }

        public async Task<Rubric> CreateRubricWithCriteriaAsync(
            Rubric rubric, List<Criterion> criteria, Guid createdBy)
        {
            rubric.Id = Guid.NewGuid();
            rubric.CreatedBy = createdBy;
            rubric.IsActive = true;
            rubric.CreatedAt = DateTime.UtcNow;

            var created = await _rubricResource.CreateRubricAsync(rubric);

            for (int i = 0; i < criteria.Count; i++)
            {
                criteria[i].Id = Guid.NewGuid();
                criteria[i].RubricId = created.Id;
                criteria[i].OrderIndex = i;
                await _rubricResource.AddCriterionAsync(criteria[i]);
            }

            return created;
        }

        public async Task DeactivateRubricAsync(Guid rubricId)
        {
            await _rubricResource.DeactivateRubricAsync(rubricId);
        }

        public async Task UpdateRubricAsync(Rubric rubric)
        {
            await _rubricResource.UpdateRubricAsync(rubric);
        }
    }
}