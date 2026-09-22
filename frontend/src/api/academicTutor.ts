import apiClient from './client'
import type { SessionDetail } from './sessions'
import type { TodayAttendance, StudentSummary } from './clinicalTutor'
import type { EvaluationDetail } from './evaluations'

export interface AcademicTutorProfile {
  id: string
  fullName: string
  email: string
  faculty: string | null
  department: string | null
  officeLocation: string | null
}

export const getAcademicTutorProfile = async (): Promise<AcademicTutorProfile> => {
  const res = await apiClient.get('/academic-tutor/me')
  return res.data
}

export const getAcademicTutorStudents = async (): Promise<StudentSummary[]> => {
  const res = await apiClient.get('/academic-tutor/students')
  return res.data
}

export const getAcademicTutorTodayAttendance = async (): Promise<TodayAttendance[]> => {
  const res = await apiClient.get('/academic-tutor/attendance/today')
  return res.data
}

export const getAcademicTutorSessionsByMonth = async (
  year: number, month: number
): Promise<SessionDetail[]> => {
  const res = await apiClient.get(`/academic-tutor/sessions?year=${year}&month=${month}`)
  return res.data
}

export const getStudentEvaluations = async (
  assignmentId: string
): Promise<EvaluationDetail[]> => {
  const res = await apiClient.get(`/academic-tutor/evaluations/${assignmentId}`)
  return res.data
}