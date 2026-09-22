using Dapper;
using System.Data;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Resources
{
    public class RubricResource
    {
        private readonly IDbConnection _db;

        public RubricResource(IDbConnection db)
        {
            DefaultTypeMap.MatchNamesWithUnderscores = true;
            _db = db;
        }

        public async Task<IEnumerable<Rubric>> GetAllActiveAsync()
        {
            const string sql = @"
                SELECT
                    r.id, r.title, r.description, r.created_by, r.is_active, r.created_at,
                    COUNT(c.id) AS criteria_count
                FROM rubrics r
                LEFT JOIN criteria c ON c.rubric_id = r.id
                WHERE r.is_active = TRUE
                GROUP BY r.id
                ORDER BY r.created_at DESC;";

            return await _db.QueryAsync<Rubric>(sql);
        }

        public async Task<Rubric?> GetWithCriteriaAsync(Guid rubricId)
        {
            const string sql = @"
                SELECT id, title, description, created_by, is_active, created_at
                FROM rubrics
                WHERE id = @RubricId AND is_active = TRUE;";

            var rubric = await _db.QueryFirstOrDefaultAsync<Rubric>(sql, new { RubricId = rubricId });
            if (rubric == null) return null;

            rubric.Criteria = (await _db.QueryAsync<Criterion>(@"
                SELECT * FROM criteria
                WHERE rubric_id = @RubricId
                ORDER BY order_index;",
                new { RubricId = rubricId })).ToList();

            return rubric;
        }

        public async Task<Rubric> CreateRubricAsync(Rubric rubric)
        {
            const string sql = @"
                INSERT INTO rubrics (id, title, description, created_by, is_active, created_at)
                VALUES (@Id, @Title, @Description, @CreatedBy, @IsActive, @CreatedAt)
                RETURNING *;";

            return await _db.QueryFirstAsync<Rubric>(sql, rubric);
        }

        public async Task AddCriterionAsync(Criterion criterion)
        {
            const string sql = @"
                INSERT INTO criteria (id, rubric_id, name, description, max_score, order_index)
                VALUES (@Id, @RubricId, @Name, @Description, @MaxScore, @OrderIndex);";

            await _db.ExecuteAsync(sql, criterion);
        }

        public async Task DeactivateRubricAsync(Guid rubricId)
        {
            await _db.ExecuteAsync(
                "UPDATE rubrics SET is_active = FALSE WHERE id = @Id;",
                new { Id = rubricId });
        }

        public async Task UpdateRubricAsync(Rubric rubric)
        {
            await _db.ExecuteAsync(@"
                UPDATE rubrics SET title = @Title, description = @Description
                WHERE id = @Id;",
                new { rubric.Id, rubric.Title, rubric.Description });

            await _db.ExecuteAsync(
                "DELETE FROM criteria WHERE rubric_id = @RubricId;",
                new { RubricId = rubric.Id });

            for (int i = 0; i < rubric.Criteria.Count; i++)
            {
                rubric.Criteria[i].Id = Guid.NewGuid();
                rubric.Criteria[i].RubricId = rubric.Id;
                rubric.Criteria[i].OrderIndex = i;
                await AddCriterionAsync(rubric.Criteria[i]);
            }
        }
    }
}