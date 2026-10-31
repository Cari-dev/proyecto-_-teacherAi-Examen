import api from './api'
import type { Plan, PlanPayload } from '../types'

export async function fetchPlans(): Promise<Plan[]> {
  const { data } = await api.get<Plan[]>('/plans')
  return data
}

export async function fetchPlan(id: number): Promise<Plan> {
  const { data } = await api.get<Plan>(`/plans/${id}`)
  return data
}

export async function createPlan(payload: PlanPayload): Promise<Plan> {
  const { data } = await api.post<Plan>('/plans', payload)
  return data
}

export async function updatePlan(id: number, payload: PlanPayload): Promise<Plan> {
  const { data } = await api.put<Plan>(`/plans/${id}`, payload)
  return data
}

export async function deletePlan(id: number): Promise<void> {
  await api.delete(`/plans/${id}`)
}
