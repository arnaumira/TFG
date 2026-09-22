using TauliPractiques.Api.Objects;
using TauliPractiques.Api.Resources;
using ClosedXML.Excel;

namespace TauliPractiques.Api.Services
{
    public class CoordinatorService
    {
        private readonly CoordinatorResource _coordinatorResource;
        private readonly AssignmentResource _assignmentResource;
        private readonly SessionResource _sessionResource;
        private readonly RubricResource _rubricResource;

        public CoordinatorService(
            CoordinatorResource coordinatorResource,
            AssignmentResource assignmentResource,
            SessionResource sessionResource,
            RubricResource rubricResource)
        {
            _coordinatorResource = coordinatorResource;
            _assignmentResource = assignmentResource;
            _sessionResource = sessionResource;
            _rubricResource = rubricResource;
        }

        public async Task<IEnumerable<StudentSummary>> GetAllStudentsAsync()
        {
            return await _coordinatorResource.GetAllStudentsAsync();
        }

        public async Task<IEnumerable<ClinicalTutor>> GetAllClinicalTutorsAsync()
        {
            return await _coordinatorResource.GetAllClinicalTutorsAsync();
        }

        public async Task<IEnumerable<AcademicTutor>> GetAllAcademicTutorsAsync()
        {
            return await _coordinatorResource.GetAllAcademicTutorsAsync();
        }

        public async Task<IEnumerable<AssignmentDetail>> GetAllAssignmentsAsync()
        {
            return await _assignmentResource.GetAllAssignmentsAsync();
        }

        public async Task<Assignment> CreateAssignmentAsync(Assignment assignment)
        {
            // Validació: estudiant amb assignació activa
            if (await _assignmentResource.StudentHasActiveAssignmentAsync(assignment.StudentId))
                throw new InvalidOperationException(
                    "L'estudiant seleccionat ja té una assignació activa.");

            // Validació: tutor clínic amb assignació activa
            if (await _assignmentResource.ClinicalTutorHasActiveAssignmentAsync(assignment.ClinicalTutorId))
                throw new InvalidOperationException(
                    "El tutor clínic seleccionat ja té una assignació activa.");

            assignment.Id = Guid.NewGuid();
            assignment.CreatedAt = DateTime.UtcNow;
            return await _assignmentResource.CreateAssignmentAsync(assignment);
        }

        public async Task<IEnumerable<SessionDetail>> GetSessionsByMonthAsync(int year, int month, Guid? studentId, Guid? clinicalTutorId)
        {
            return await _sessionResource.GetSessionsByMonthForCoordinatorAsync(
                year, month, studentId, clinicalTutorId);
        }

        public async Task<IEnumerable<UserDetail>> GetAllUsersAsync()
        {
            return await _coordinatorResource.GetAllUsersAsync();
        }

        public async Task<CoordinatorStats> GetStatsAsync()
        {
            return await _coordinatorResource.GetStatsAsync();
        }

        public async Task<List<ImportRowResult>> ParseImportFileAsync(Stream fileStream)
        {
            // Carreguem usuaris i indexem per email
            var students = (await _coordinatorResource.GetAllStudentsAsync())
                .ToDictionary(s => s.Email.Trim().ToLower(), s => s);
            var clinicals = (await _coordinatorResource.GetAllClinicalTutorsAsync())
                .ToDictionary(t => t.Email.Trim().ToLower(), t => t);
            var academics = (await _coordinatorResource.GetAllAcademicTutorsAsync())
                .ToDictionary(t => t.Email.Trim().ToLower(), t => t);

            var results = new List<ImportRowResult>();

            using var workbook = new XLWorkbook(fileStream);
            var ws = workbook.Worksheet(1);
            var usedRows = ws.RangeUsed()?.RowsUsed().Skip(1); // saltem la capçalera
            if (usedRows == null) return results;

            int rowNum = 1;
            foreach (var row in usedRows)
            {
                rowNum++;
                var r = new ImportRowResult
                {
                    RowNumber = rowNum,
                    StudentEmail = row.Cell(1).GetString().Trim(),
                    ClinicalTutorEmail = row.Cell(2).GetString().Trim(),
                    AcademicTutorEmail = row.Cell(3).GetString().Trim(),
                    Area = row.Cell(4).GetString().Trim(),
                    Building = row.Cell(5).GetString().Trim(),
                    Floor = row.Cell(6).GetString().Trim(),
                    Unit = row.Cell(7).GetString().Trim(),
                    StartDate = ParseDate(row.Cell(8)),
                    EndDate = ParseDate(row.Cell(9)),
                    AcademicYear = row.Cell(10).GetString().Trim(),
                };

                var errors = new List<string>();

                if (students.TryGetValue(r.StudentEmail.ToLower(), out var st))
                {
                    r.StudentId = st.Id;
                    r.StudentName = st.FullName;
                }
                else errors.Add($"Estudiant no trobat ({r.StudentEmail})");

                if (clinicals.TryGetValue(r.ClinicalTutorEmail.ToLower(), out var ct))
                {
                    r.ClinicalTutorId = ct.Id;
                    r.ClinicalTutorName = ct.FullName;
                }
                else errors.Add($"Tutor clínic no trobat ({r.ClinicalTutorEmail})");

                if (academics.TryGetValue(r.AcademicTutorEmail.ToLower(), out var at))
                {
                    r.AcademicTutorId = at.Id;
                    r.AcademicTutorName = at.FullName;
                }
                else errors.Add($"Tutor acadèmic no trobat ({r.AcademicTutorEmail})");

                if (r.StartDate == null) errors.Add("Data d'inici invàlida");
                if (r.EndDate == null) errors.Add("Data de fi invàlida");
                if (string.IsNullOrWhiteSpace(r.Area)) errors.Add("Àrea buida");

                r.IsValid = errors.Count == 0;
                r.Error = errors.Count > 0 ? string.Join(" · ", errors) : null;

                results.Add(r);
            }

            return results;
        }

        private static DateTime? ParseDate(IXLCell cell)
        {
            if (cell.DataType == XLDataType.DateTime)
                return cell.GetDateTime();

            var s = cell.GetString().Trim();
            if (string.IsNullOrEmpty(s)) return null;

            // Accepta dd/MM/yyyy i formats estàndard
            if (DateTime.TryParse(s, out var d)) return d;
            if (DateTime.TryParseExact(s, "dd/MM/yyyy",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var d2)) return d2;

            return null;
        }

        public async Task<int> ImportAssignmentsAsync(List<ImportAssignmentDto> rows)
        {
            int count = 0;
            foreach (var r in rows)
            {
                await _assignmentResource.CreateAssignmentAsync(new Assignment
                {
                    Id = Guid.NewGuid(),
                    StudentId = r.StudentId,
                    ClinicalTutorId = r.ClinicalTutorId,
                    AcademicTutorId = r.AcademicTutorId,
                    AcademicYear = r.AcademicYear,
                    Area = r.Area,
                    Building = r.Building,
                    Floor = r.Floor,
                    Unit = r.Unit,
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    CreatedAt = DateTime.UtcNow
                });
                count++;
            }
            return count;
        }

        public List<RubricImportResult> ParseRubricImportFile(Stream fileStream)
        {
            using var workbook = new XLWorkbook(fileStream);
            var ws = workbook.Worksheet(1);
            var usedRows = ws.RangeUsed()?.RowsUsed().Skip(1);

            var grouped = new Dictionary<string, RubricImportResult>();

            if (usedRows == null) return new List<RubricImportResult>();

            foreach (var row in usedRows)
            {
                var title = row.Cell(1).GetString().Trim();
                var rubricDesc = row.Cell(2).GetString().Trim();
                var critName = row.Cell(3).GetString().Trim();
                var critDesc = row.Cell(4).GetString().Trim();
                var maxScoreStr = row.Cell(5).GetString().Trim();

                if (string.IsNullOrWhiteSpace(title)) continue;

                if (!grouped.TryGetValue(title, out var rubric))
                {
                    rubric = new RubricImportResult
                    {
                        Title = title,
                        Description = string.IsNullOrWhiteSpace(rubricDesc) ? null : rubricDesc
                    };
                    grouped[title] = rubric;
                }

                if (!string.IsNullOrWhiteSpace(critName))
                {
                    int.TryParse(maxScoreStr, out var maxScore);
                    if (maxScore <= 0) maxScore = 10;

                    rubric.Criteria.Add(new RubricImportCriterion
                    {
                        Name = critName,
                        Description = string.IsNullOrWhiteSpace(critDesc) ? null : critDesc,
                        MaxScore = maxScore
                    });
                }
            }

            // Validació
            foreach (var rubric in grouped.Values)
            {
                if (rubric.Criteria.Count == 0)
                {
                    rubric.IsValid = false;
                    rubric.Error = "Sense criteris";
                }
                else
                {
                    rubric.IsValid = true;
                }
            }

            return grouped.Values.ToList();
        }

        public async Task<int> ImportRubricsAsync(List<RubricImportResult> rubrics, Guid coordinatorId)
        {
            int count = 0;
            foreach (var r in rubrics)
            {
                // 1. Crea la rúbrica
                var rubric = new Rubric
                {
                    Id = Guid.NewGuid(),
                    Title = r.Title,
                    Description = r.Description,
                    CreatedBy = coordinatorId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                var created = await _rubricResource.CreateRubricAsync(rubric);

                for (int i = 0; i < r.Criteria.Count; i++)
                {
                    await _rubricResource.AddCriterionAsync(new Criterion
                    {
                        Id = Guid.NewGuid(),
                        RubricId = created.Id,
                        Name = r.Criteria[i].Name,
                        Description = r.Criteria[i].Description,
                        MaxScore = r.Criteria[i].MaxScore,
                        OrderIndex = i
                    });
                }

                count++;
            }
            return count;
        }
    }
}