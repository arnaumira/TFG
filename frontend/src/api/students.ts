import apiClient from './client'

export interface StudentProfile {
  id: string
  fullName: string
  email: string
  university: string
  niu: string | null
  enrollmentYear: number | null
  currentCourse: number | null
  degree: string
}

export const getMyProfile = async (): Promise<StudentProfile> => {
  const res = await apiClient.get('/student/me')
  return res.data
}