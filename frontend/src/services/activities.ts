import api from './api'
import type { Activity, ActivityPayload } from '../types'

export async function fetchActivities(): Promise<Activity[]> {
  const { data } = await api.get<Activity[]>('/activities')
  return data
}

export async function fetchActivity(id: number): Promise<Activity> {
  const { data } = await api.get<Activity>(`/activities/${id}`)
  return data
}

export async function createActivity(payload: ActivityPayload): Promise<Activity> {
  const { data } = await api.post<Activity>('/activities', payload)
  return data
}

export async function deleteActivity(id: number): Promise<void> {
  await api.delete(`/activities/${id}`)
}
