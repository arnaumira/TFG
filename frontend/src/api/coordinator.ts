import apiClient from './client'
import type { AssignmentDetail } from './assignments'
import type { SessionDetail } from './sessions'

export interface StudentOption {
  id: string
  fullName: string
  email: string
  currentCourse: number | null
  university: string
  assignmentId: string | null
}

export interface ClinicalTutorOption {
  id: string
  fullName: string
  specialty: string | null
  department: string | null
}

export interface AcademicTutorOption {
  id: string
  fullName: string
  faculty: string | null
  department: string | null
}

export interface NewAssignment {
  studentId: string
  clinicalTutorId: string
  academicTutorId: string
  academicYear: string
  area: string
  building: string
  floor: string
  unit: string
  startDate: string
  endDate: string
}

export interface Schedule {
  id: string
  assignmentId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  building: string | null
  floor: string | null
  unit: string | null
}

export interface UpdateSchedule {
  assignmentId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  building?: string
  floor?: string
  unit?: string
}

export interface UserDetail {
  id: string
  fullName: string
  email: string
  role: 'student' | 'clinical_tutor' | 'academic_tutor'
  // Student
  university?: string
  niu?: string
  currentCourse?: number
  degree?: string
  // ClinicalTutor
  specialty?: string
  licenseNumber?: string
  // AcademicTutor
  faculty?: string
  officeLocation?: string
  // Compartit tutors
  department?: string
  // Assignació
  assignmentId?: string
  area?: string
  unit?: string
  building?: string
  floor?: string
  clinicalTutorName?: string
  academicTutorName?: string
  assignmentStartDate?: string
  assignmentEndDate?: string
  // Tutors
  studentCount?: number
}

export interface CoordinatorStats {
  studentCount: number
  clinicalTutorCount: number
  academicTutorCount: number
  assignmentCount: number
  rubricCount: number
}

export const getAllStudents = async (): Promise<StudentOption[]> => {
  const res = await apiClient.get('/coordinator/students')
  return res.data
}

export const getAllClinicalTutors = async (): Promise<ClinicalTutorOption[]> => {
  const res = await apiClient.get('/coordinator/clinical-tutors')
  return res.data
}

export const getAllAcademicTutors = async (): Promise<AcademicTutorOption[]> => {
  const res = await apiClient.get('/coordinator/academic-tutors')
  return res.data
}

export const getAllAssignments = async (): Promise<AssignmentDetail[]> => {
  const res = await apiClient.get('/coordinator/assignments')
  return res.data
}

export const createAssignment = async (data: NewAssignment): Promise<AssignmentDetail> => {
  const res = await apiClient.post('/coordinator/assignments', data)
  return res.data
}

export const getCoordinatorSessions = async (
  year: number,
  month: number,
  studentId?: string,
  clinicalTutorId?: string
): Promise<SessionDetail[]> => {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
    ...(studentId ? { studentId } : {}),
    ...(clinicalTutorId ? { clinicalTutorId } : {}),
  })
  const res = await apiClient.get(`/coordinator/sessions?${params}`)
  return res.data
}

export const getAllUsers = async (): Promise<UserDetail[]> => {
  const res = await apiClient.get('/coordinator/users')
  return res.data
}

export const getStats = async (): Promise<CoordinatorStats> => {
  const res = await apiClient.get('/coordinator/stats')
  return res.data
}

// ---- Schedules ----
export const getSchedulesByAssignment = async (
  assignmentId: string
): Promise<Schedule[]> => {
  const res = await apiClient.get(`/assignment/${assignmentId}/schedules`)
  return res.data
}

export const createSchedule = async (
  assignmentId: string,
  data: UpdateSchedule
): Promise<void> => {
  await apiClient.post(`/assignment/${assignmentId}/schedules`, data)
}

export const updateSchedule = async (
  scheduleId: string,
  data: UpdateSchedule
): Promise<void> => {
  await apiClient.put(`/assignment/${data.assignmentId}/schedules/${scheduleId}`, data)
}

export const deleteSchedule = async (
  assignmentId: string,
  scheduleId: string
): Promise<void> => {
  await apiClient.delete(`/assignment/${assignmentId}/schedules/${scheduleId}`)
}

// ---- Sessions ----
export const getAssignmentSessions = async (
  assignmentId: string,
  year: number,
  month: number
): Promise<SessionDetail[]> => {
  const res = await apiClient.get(
    `/assignment/${assignmentId}/sessions?year=${year}&month=${month}`)
  return res.data
}

export const updateSession = async (
  sessionId: string,
  data: {
    startTime: string
    endTime: string
    building?: string
    floor?: string
    unit?: string
  }
): Promise<void> => {
  await apiClient.patch(`/assignment/sessions/${sessionId}`, data)
}

export interface ImportRowResult {
  rowNumber: number
  studentEmail: string
  clinicalTutorEmail: string
  academicTutorEmail: string
  area: string
  building: string
  floor: string
  unit: string
  startDate: string | null
  endDate: string | null
  academicYear: string
  studentId: string | null
  clinicalTutorId: string | null
  academicTutorId: string | null
  studentName: string | null
  clinicalTutorName: string | null
  academicTutorName: string | null
  isValid: boolean
  error: string | null
}

export const previewImport = async (file: File): Promise<ImportRowResult[]> => {
  const form = new FormData()
  form.append('file', file)
  const res = await apiClient.post('/coordinator/assignments/import-preview', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export const importAssignments = async (rows: {
  studentId: string
  clinicalTutorId: string
  academicTutorId: string
  academicYear: string
  area: string
  building: string
  floor: string
  unit: string
  startDate: string
  endDate: string
}[]): Promise<number> => {
  const res = await apiClient.post('/coordinator/assignments/import', rows)
  return res.data.imported
}