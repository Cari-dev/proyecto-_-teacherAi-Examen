export interface Plan {
  id: number
  title: string
  subject: string
  education_level: string
  course: string
  topic: string
  learning_objective: string
  duration_minutes: number
  content: string
  activities: string
  resources: string
  is_demo: boolean
  created_at: string
  updated_at: string
}

export type PlanPayload = Omit<Plan, 'id' | 'is_demo' | 'created_at' | 'updated_at'>

export interface Activity {
  id: number
  title: string
  subject: string
  education_level: string
  topic: string
  description: string
  activity_type: string
  estimated_duration_minutes: number
  is_demo: boolean
  created_at: string
}

export type ActivityPayload = Omit<Activity, 'id' | 'is_demo' | 'created_at'>

export interface QuestionOption {
  id: number
  text: string
  is_correct: boolean
  order_index: number
}

export interface AssessmentQuestion {
  id: number
  text: string
  order_index: number
  options: QuestionOption[]
}

export interface AssessmentSummary {
  id: number
  title: string
  subject: string
  education_level: string
  instructions: string
  is_demo: boolean
  created_at: string
  question_count: number
}

export interface AssessmentDetail extends AssessmentSummary {
  questions: AssessmentQuestion[]
}

export interface AssessmentQuestionInput {
  text: string
  options: string[]
  correct_option_index: number
}

export interface AssessmentPayload {
  title: string
  subject: string
  education_level: string
  instructions: string
  questions: AssessmentQuestionInput[]
}

export interface DashboardStats {
  plans: number
  activities: number
  assessments: number
  questions: number
}

export interface RecentPlan {
  id: number
  title: string
  subject: string
  education_level: string
  created_at: string
  is_demo: boolean
}

export interface DashboardData {
  teacher_name: string
  assistant_mode: 'demo' | 'gemini'
  stats: DashboardStats
  latest_plans: RecentPlan[]
}

export type ContentType = 'ideas' | 'activities' | 'questions' | 'explanation' | 'adaptation'

export interface AssistantRequest {
  topic: string
  subject: string
  education_level: string
  content_type: ContentType
  additional_instructions?: string | null
}

export interface AssistantResponse {
  content: string
  source: 'demo' | 'gemini'
  model: string | null
  notice: string
  generated_at: string
}

export interface HealthResponse {
  status: string
  app: string
  version: string
  database: string
  assistant_mode: 'demo' | 'gemini'
}
