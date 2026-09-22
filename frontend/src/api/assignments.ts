import apiClient from './client'

export interface AssignmentDetail {
  id: string
  academicYear: string
  area: string
  building: string
  floor: string
  unit: string
  startDate: string
  endDate: string
  clinicalTutorName: string
  academicTutorName: string
  studentName?: string
}

export const getCurrentAssignment = async (): Promise<AssignmentDetail> => {
  const res = await apiClient.get('/assignment/current')
  return res.data
}