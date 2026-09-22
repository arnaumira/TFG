using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;

namespace TauliPractiques.Api.Services
{
    public class EvaluationService
    {
        private readonly EvaluationResource _evaluationResource;

        public EvaluationService(EvaluationResource evaluationResource)
        {
            _evaluationResource = evaluationResource;
        }

        public async Task<Evaluation> CreateEvaluationAsync(Evaluation evaluation, Guid tutorId)
        {
            evaluation.Id = Guid.NewGuid();
            evaluation.EvaluatedBy = tutorId;
            evaluation.EvaluatedAt = DateTime.UtcNow;

            var created = await _evaluationResource.CreateEvaluationAsync(evaluation);

            var scores = evaluation.Scores.Select(s => new EvaluationScore
            {
                Id = Guid.NewGuid(),
                EvaluationId = created.Id,
                CriteriaId = s.CriteriaId,
                Score = s.Score
            });

            await _evaluationResource.AddScoresAsync(scores);

            return created;
        }

        public async Task<IEnumerable<EvaluationDetail>> GetByAssignmentAsync(Guid assignmentId)
        {
            return await _evaluationResource.GetByAssignmentAsync(assignmentId);
        }

        public async Task<EvaluationDetail?> GetByAssignmentAndRubricAsync(Guid assignmentId, Guid rubricId)
        {
            return await _evaluationResource.GetByAssignmentAndRubricAsync(assignmentId, rubricId);
        }

        public async Task UpdateEvaluationAsync(Guid evaluationId, Evaluation evaluation)
        {
            await _evaluationResource.UpdateEvaluationAsync(evaluationId, evaluation);
        }
    }
}