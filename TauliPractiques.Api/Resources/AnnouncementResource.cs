using Dapper;
using System.Data;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Resources
{
    public class AnnouncementResource
    {
        private readonly IDbConnection _db;

        public AnnouncementResource(IDbConnection db)
        {
            DefaultTypeMap.MatchNamesWithUnderscores = true;
            _db = db;
        }

        public async Task CreateAsync(Announcement a)
        {
            await _db.ExecuteAsync(@"
                INSERT INTO announcements (id, title, body, target, created_by, created_at)
                VALUES (@Id, @Title, @Body, @Target, @CreatedBy, @CreatedAt);", a);
        }

        public async Task<IEnumerable<Announcement>> GetSentAsync(Guid coordinatorId)
        {
            return await _db.QueryAsync<Announcement>(@"
                SELECT * FROM announcements
                WHERE created_by = @Id
                ORDER BY created_at DESC;",
                new { Id = coordinatorId });
        }

        public async Task<IEnumerable<AnnouncementDetail>> GetForUserAsync(Guid userId, string role)
        {
            const string sql = @"
                SELECT
                    a.id, a.title, a.body, a.target, a.created_at,
                    (ar.id IS NOT NULL) AS is_read
                FROM announcements a
                LEFT JOIN announcement_reads ar
                    ON ar.announcement_id = a.id AND ar.user_id = @UserId
                WHERE a.target = 'all' OR a.target = @Role
                ORDER BY a.created_at DESC;";

            return await _db.QueryAsync<AnnouncementDetail>(sql,
                new { UserId = userId, Role = role });
        }

        public async Task<int> GetUnreadCountAsync(Guid userId, string role)
        {
            const string sql = @"
                SELECT COUNT(*)
                FROM announcements a
                LEFT JOIN announcement_reads ar
                    ON ar.announcement_id = a.id AND ar.user_id = @UserId
                WHERE (a.target = 'all' OR a.target = @Role) AND ar.id IS NULL;";

            return await _db.ExecuteScalarAsync<int>(sql,
                new { UserId = userId, Role = role });
        }

        public async Task MarkReadAsync(Guid announcementId, Guid userId)
        {
            await _db.ExecuteAsync(@"
                INSERT INTO announcement_reads (id, announcement_id, user_id, read_at)
                VALUES (gen_random_uuid(), @AnnouncementId, @UserId, NOW())
                ON CONFLICT (announcement_id, user_id) DO NOTHING;",
                new { AnnouncementId = announcementId, UserId = userId });
        }

        public async Task DeleteAsync(Guid id)
        {
            await _db.ExecuteAsync("DELETE FROM announcements WHERE id = @Id;", new { Id = id });
        }
    }
}