import apiClient from './client'

export type AnnouncementTarget = 'all' | 'student' | 'clinical_tutor' | 'academic_tutor'

export interface Announcement {
  id: string
  title: string
  body: string
  target: AnnouncementTarget
  createdAt: string
}

export interface AnnouncementDetail {
  id: string
  title: string
  body: string
  target: AnnouncementTarget
  createdAt: string
  isRead: boolean
}

export const createAnnouncement = async (data: {
  title: string; body: string; target: AnnouncementTarget
}): Promise<void> => {
  await apiClient.post('/announcements', data)
}

export const getSentAnnouncements = async (): Promise<Announcement[]> => {
  const res = await apiClient.get('/announcements/sent')
  return res.data
}

export const getMyAnnouncements = async (): Promise<AnnouncementDetail[]> => {
  const res = await apiClient.get('/announcements/mine')
  return res.data
}

export const getUnreadCount = async (): Promise<number> => {
  const res = await apiClient.get('/announcements/unread-count')
  return res.data.count
}

export const markAnnouncementRead = async (id: string): Promise<void> => {
  await apiClient.patch(`/announcements/${id}/read`)
}

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await apiClient.delete(`/announcements/${id}`)
}