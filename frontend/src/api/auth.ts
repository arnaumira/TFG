import apiClient from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface StudentRegister {
  email: string
  password: string
  fullName: string
  university: string
  niu: string
  enrollmentYear: number | ''
  currentCourse: number | ''
  degree: string
  role: string 
}

export interface AuthResponse {
  token: string
  fullName: string
  role: string
  userId: string
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await apiClient.post('/auth/login', data)
  return res.data
}

export const registerStudent = async (data: StudentRegister): Promise<AuthResponse> => {
  const res = await apiClient.post('/auth/register', data)
  return res.data
}