import apiClient from './client'

export const generateQrToken = async (sessionId: string): Promise<string> => {
  const res = await apiClient.get(`/attendance/qr/${sessionId}`)
  return res.data.token
}

export const scanQr = async (token: string): Promise<void> => {
  await apiClient.post('/attendance/scan', { token })
}

export const registerManualAttendance = async (sessionId: string): Promise<void> => {
  await apiClient.post(`/attendance/manual/${sessionId}`)
}