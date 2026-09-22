import apiClient from './client'

export interface SessionDetail {
  id: string
  sessionDate: string
  startTime: string
  endTime: string
  building: string
  floor: string
  unit: string
  clinicalTutorName: string
  status: string
  notes: string | null
  studentName?: string
  attendanceStatus?: string
}

export const getSessionsByMonth = async (
  assignmentId: string,
  year: number,
  month: number
): Promise<SessionDetail[]> => {
  const res = await apiClient.get(
    `/assignment/${assignmentId}/sessions?year=${year}&month=${month}`
  )
  return res.data
}

export const getSessionByDate = async (
  assignmentId: string,
  date: string
): Promise<SessionDetail | null> => {
  try {
    const res = await apiClient.get(
      `/assignment/${assignmentId}/sessions/${date}`
    )
    return res.data
  } catch {
    return null
  }
}