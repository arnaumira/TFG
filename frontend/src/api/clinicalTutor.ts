import apiClient from './client'
import type { SessionDetail } from './sessions'


export interface ClinicalTutorProfile {
  id: string
  fullName: string
  email: string
  specialty: string | null
  department: string | null
  licenseNumber: string | null
}

export interface StudentSummary {
  id: string
  fullName: string
  email: string
  currentCourse: number | null
  university: string
  assignmentId: string
  area: string
  unit: string
}

export interface TodayAttendance {
  studentId: string
  studentName: string
  sessionId: string
  startTime: string
  endTime: string
  attendanceStatus: 'present' | 'absent' | 'pending'
}

export const getClinicalTutorProfile = async (): Promise<ClinicalTutorProfile> => {
  const res = await apiClient.get('/clinical-tutor/me')
  return res.data
}

export const getAssignedStudents = async (): Promise<StudentSummary[]> => {
  const res = await apiClient.get('/clinical-tutor/students')
  return res.data
}

export const getTodayAttendance = async (): Promise<TodayAttendance[]> => {
  const res = await apiClient.get('/clinical-tutor/attendance/today')
  return res.data
}

export const getSessionsByMonth = async (
  year: number,
  month: number
): Promise<SessionDetail[]> => {
  const res = await apiClient.get(`/clinical-tutor/sessions?year=${year}&month=${month}`)
  return res.data
}