import api from './api'
import type { AssistantRequest, AssistantResponse } from '../types'

export async function generateAssistantContent(payload: AssistantRequest): Promise<AssistantResponse> {
  const { data } = await api.post<AssistantResponse>('/assistant/generate', payload, {
    timeout: 105_000,
  })
  return data
}
