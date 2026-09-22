import apiClient from './client'

export interface CriterionScore {
  criteriaId: string
  criterionName: string
  score: number
  maxScore: number
}

export interface EvaluationDetail {
  id: string
  assignmentId: string
  rubricTitle: string
  evaluatedByName: string
  evaluatedAt: string
  comments: string | null
  scores: CriterionScore[]
}

export interface Criterion {
  id: string
  rubricId: string
  name: string
  description: string | null
  maxScore: number
  orderIndex: number
}

export interface Rubric {
  id: string
  title: string
  description: string | null
  criteria: Criterion[]
  criteriaCount?: number
}

export interface EvaluationScore {
  criteriaId: string
  score: number
}

export interface NewEvaluationPayload {
  assignmentId: string
  rubricId: string
  comments: string
  scores: EvaluationScore[]
}

export const getRubrics = async (): Promise<Rubric[]> => {
  const res = await apiClient.get('/rubric')
  return res.data
}

export const getRubricWithCriteria = async (rubricId: string): Promise<Rubric> => {
  const res = await apiClient.get(`/rubric/${rubricId}`)
  return res.data
}

export const getEvaluationsByAssignment = async (
  assignmentId: string
): Promise<EvaluationDetail[]> => {
  const res = await apiClient.get(`/evaluation/assignment/${assignmentId}`)
  return res.data
}

export const createEvaluation = async (
  payload: NewEvaluationPayload
): Promise<void> => {
  await apiClient.post('/evaluation', payload)
}

export const getEvaluationByAssignmentAndRubric = async (
  assignmentId: string,
  rubricId: string
): Promise<EvaluationDetail | null> => {
  try {
    const res = await apiClient.get(
      `/evaluation/assignment/${assignmentId}/rubric/${rubricId}`
    )
    return res.data
  } catch {
    return null
  }
}

export const updateEvaluation = async (
  evaluationId: string,
  payload: NewEvaluationPayload
): Promise<void> => {
  await apiClient.put(`/evaluation/${evaluationId}`, payload)
}

export const updateRubric = async (rubricId: string, rubric: Rubric): Promise<void> => {
  await apiClient.put(`/rubric/${rubricId}`, rubric)
}

export const createRubric = async (rubric: Rubric): Promise<void> => {
  await apiClient.post('/rubric', rubric)
}

export interface RubricImportCriterion {
  name: string
  description: string | null
  maxScore: number
}

export interface RubricImportResult {
  title: string
  description: string | null
  criteria: RubricImportCriterion[]
  isValid: boolean
  error: string | null
}

export const previewRubricImport = async (file: File): Promise<RubricImportResult[]> => {
  const form = new FormData()
  form.append('file', file)
  const res = await apiClient.post('/coordinator/rubrics/import-preview', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const importRubrics = async (
  rubrics: RubricImportResult[]
): Promise<number> => {
  const res = await apiClient.post('/coordinator/rubrics/import', rubrics)
  return res.data.imported
}