using Dapper;
using System.Data;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Resources
{
    public class EvaluationResource
    {
        private readonly IDbConnection _db;

        public EvaluationResource(IDbConnection db)
        {
            DefaultTypeMap.MatchNamesWithUnderscores = true;
            _db = db;
        }

        public async Task<Evaluation> CreateEvaluationAsync(Evaluation evaluation)
        {
            const string sql = @"
                INSERT INTO evaluations
                    (id, assignment_id, rubric_id, evaluated_by, evaluated_at, comments)
                VALUES
                    (@Id, @AssignmentId, @RubricId, @EvaluatedBy, @EvaluatedAt, @Comments)
                RETURNING *;";

            return await _db.QueryFirstAsync<Evaluation>(sql, evaluation);
        }

        public async Task AddScoresAsync(IEnumerable<EvaluationScore> scores)
        {
            const string sql = @"
                INSERT INTO evaluation_scores (id, evaluation_id, criteria_id, score)
                VALUES (@Id, @EvaluationId, @CriteriaId, @Score);";

            await _db.ExecuteAsync(sql, scores);
        }

        public async Task<IEnumerable<EvaluationDetail>> GetByAssignmentAsync(Guid assignmentId)
        {
            const string sql = @"
                SELECT
                    e.id,
                    e.assignment_id,
                    r.title AS rubric_title,
                    ct.full_name AS evaluated_by_name,
                    e.evaluated_at,
                    e.comments
                FROM evaluations e
                JOIN rubrics r ON r.id = e.rubric_id
                JOIN clinical_tutors ct ON ct.id = e.evaluated_by
                WHERE e.assignment_id = @AssignmentId
                ORDER BY e.evaluated_at DESC;";

            var evaluations = (await _db.QueryAsync<EvaluationDetail>(sql,
                new { AssignmentId = assignmentId })).ToList();

            foreach (var eval in evaluations)
            {
                eval.Scores = (await _db.QueryAsync<CriterionScore>(@"
                    SELECT
                        es.criteria_id,
                        c.name AS criterion_name,
                        es.score,
                        c.max_score
                    FROM evaluation_scores es
                    JOIN criteria c ON c.id = es.criteria_id
                    WHERE es.evaluation_id = @EvaluationId
                    ORDER BY c.order_index;",
                    new { EvaluationId = eval.Id })).ToList();
            }

            return evaluations;
        }

        public async Task<EvaluationDetail?> GetByAssignmentAndRubricAsync(Guid assignmentId, Guid rubricId)
        {
            const string sql = @"
                SELECT
                    e.id,
                    e.assignment_id,
                    r.title AS rubric_title,
                    ct.full_name AS evaluated_by_name,
                    e.evaluated_at,
                    e.comments
                FROM evaluations e
                JOIN rubrics r ON r.id = e.rubric_id
                JOIN clinical_tutors ct ON ct.id = e.evaluated_by
                WHERE e.assignment_id = @AssignmentId
                    AND e.rubric_id = @RubricId
                ORDER BY e.evaluated_at DESC
                LIMIT 1;";

            var evaluation = await _db.QueryFirstOrDefaultAsync<EvaluationDetail>(sql,
                new { AssignmentId = assignmentId, RubricId = rubricId });

            if (evaluation == null) return null;

            evaluation.Scores = (await _db.QueryAsync<CriterionScore>(@"
                SELECT
                    es.criteria_id,
                    c.name AS criterion_name,
                    es.score,
                    c.max_score
                FROM evaluation_scores es
                JOIN criteria c ON c.id = es.criteria_id
                WHERE es.evaluation_id = @EvaluationId
                ORDER BY c.order_index;",
                new { EvaluationId = evaluation.Id })).ToList();

            return evaluation;
        }

        public async Task UpdateEvaluationAsync(Guid evaluationId, Evaluation evaluation)
        {
            await _db.ExecuteAsync(@"
                UPDATE evaluations
                SET comments = @Comments, evaluated_at = @EvaluatedAt
                WHERE id = @Id;",
                new { Id = evaluationId, evaluation.Comments, EvaluatedAt = DateTime.UtcNow });

            await _db.ExecuteAsync(
                "DELETE FROM evaluation_scores WHERE evaluation_id = @EvaluationId;",
                new { EvaluationId = evaluationId });

            var scores = evaluation.Scores.Select(s => new EvaluationScore
            {
                Id = Guid.NewGuid(),
                EvaluationId = evaluationId,
                CriteriaId = s.CriteriaId,
                Score = s.Score
            });

            await _db.ExecuteAsync(@"
                INSERT INTO evaluation_scores (id, evaluation_id, criteria_id, score)
                VALUES (@Id, @EvaluationId, @CriteriaId, @Score);",
                scores);
        }
    }
}