using Dapper;
using System.Data;
using TauliPractiques.Api.Objects;

namespace TauliPractiques.Api.Resources
{
    public class AttendanceResource
    {
        private readonly IDbConnection _db;

        public AttendanceResource(IDbConnection db)
        {
            DefaultTypeMap.MatchNamesWithUnderscores = true;
            _db = db;
        }

        public async Task<string> GenerateQrTokenAsync(Guid sessionId)
        {
            // Si ja existeix un QR per aquesta sessió, el retornem
            var existing = await _db.QueryFirstOrDefaultAsync<string>(
                "SELECT token FROM qr_codes WHERE session_id = @SessionId;",
                new { SessionId = sessionId });

            if (existing != null) return existing;

            // Si no, en creem un de nou
            const string sql = @"
                INSERT INTO qr_codes (session_id)
                VALUES (@SessionId)
                RETURNING token;";

            return await _db.QueryFirstAsync<string>(sql, new { SessionId = sessionId });
        }

        public async Task<bool> RegisterAttendanceByTokenAsync(string token, Guid studentId)
        {
            // Busquem la sessió associada al token
            var sessionId = await _db.QueryFirstOrDefaultAsync<Guid?>(
                "SELECT session_id FROM qr_codes WHERE token = @Token;",
                new { Token = token });

            if (sessionId == null) return false;

            // Comprovem si ja ha fitxat
            var existing = await _db.QueryFirstOrDefaultAsync<int>(
                "SELECT COUNT(*) FROM attendances WHERE session_id = @SessionId AND student_id = @StudentId;",
                new { SessionId = sessionId, StudentId = studentId });

            if (existing > 0) return true; // ja estava registrat

            await _db.ExecuteAsync(@"
                INSERT INTO attendances (session_id, student_id, method)
                VALUES (@SessionId, @StudentId, 'qr');",
                new { SessionId = sessionId, StudentId = studentId });

            // Marcar la sessió com a completada
            await _db.ExecuteAsync(@"
                UPDATE sessions SET status = 'completed'
                WHERE id = @SessionId;",
                new { SessionId = sessionId });

            return true;
        }

        public async Task RegisterManualAttendanceAsync(Guid sessionId, Guid studentId)
        {
            var existing = await _db.QueryFirstOrDefaultAsync<int>(
                "SELECT COUNT(*) FROM attendances WHERE session_id = @SessionId AND student_id = @StudentId;",
                new { SessionId = sessionId, StudentId = studentId });

            if (existing > 0) return;

            await _db.ExecuteAsync(@"
                INSERT INTO attendances (session_id, student_id, method)
                VALUES (@SessionId, @StudentId, 'manual');",
                new { SessionId = sessionId, StudentId = studentId });

            await _db.ExecuteAsync(@"
                UPDATE sessions SET status = 'completed'
                WHERE id = @SessionId;",
                new { SessionId = sessionId });
        }
    }
}