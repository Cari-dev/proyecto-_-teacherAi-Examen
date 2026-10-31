import api from './api'
import type { AssessmentDetail, AssessmentPayload, AssessmentSummary } from '../types'

export async function fetchAssessments(): Promise<AssessmentSummary[]> {
  const { data } = await api.get<AssessmentSummary[]>('/assessments')
  return data
}

export async function fetchAssessment(id: number): Promise<AssessmentDetail> {
  const { data } = await api.get<AssessmentDetail>(`/assessments/${id}`)
  return data
}

export async function createAssessment(payload: AssessmentPayload): Promise<AssessmentDetail> {
  const { data } = await api.post<AssessmentDetail>('/assessments', payload)
  return data
}

export async function deleteAssessment(id: number): Promise<void> {
  await api.delete(`/assessments/${id}`)
}
