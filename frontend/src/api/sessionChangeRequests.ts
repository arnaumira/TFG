import apiClient from './client'

export interface CreateChangeRequest {
  sessionId: string
  proposedDate: string
  proposedStart: string
  proposedEnd: string
  reason: string
}

export interface SessionChangeRequestDetail {
  id: string
  sessionId: string
  originalDate: string
  originalStart: string
  originalEnd: string
  proposedDate: string
  proposedStart: string
  proposedEnd: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  studentName: string
  createdAt: string
}

export const createChangeRequest = async (data: CreateChangeRequest): Promise<void> => {
  await apiClient.post('/session-change-requests', data)
}

export const getWorkedDates = async (assignmentId: string): Promise<string[]> => {
  const res = await apiClient.get(`/session-change-requests/worked-dates/${assignmentId}`)
  return res.data
}

export const getMyChangeRequests = async (
  assignmentId: string
): Promise<SessionChangeRequestDetail[]> => {
  const res = await apiClient.get(`/session-change-requests/assignment/${assignmentId}`)
  return res.data
}

export const getChangeRequestsByAcademicTutor =
  async (): Promise<SessionChangeRequestDetail[]> => {
    const res = await apiClient.get('/session-change-requests/academic-tutor')
    return res.data
  }

export const approveChangeRequest = async (requestId: string): Promise<void> => {
  await apiClient.patch(`/session-change-requests/${requestId}/approve`)
}

export const rejectChangeRequest = async (requestId: string): Promise<void> => {
  await apiClient.patch(`/session-change-requests/${requestId}/reject`)
}