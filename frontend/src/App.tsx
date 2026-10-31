import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './components/ToastProvider'
import { AppLayout } from './layouts/AppLayout'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { ActivityDetailPage } from './pages/ActivityDetailPage'
import { ActivityFormPage } from './pages/ActivityFormPage'
import { AssessmentDetailPage } from './pages/AssessmentDetailPage'
import { AssessmentFormPage } from './pages/AssessmentFormPage'
import { AssessmentsPage } from './pages/AssessmentsPage'
import { AssistantPage } from './pages/AssistantPage'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlanDetailPage } from './pages/PlanDetailPage'
import { PlanFormPage } from './pages/PlanFormPage'
import { PlansPage } from './pages/PlansPage'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="planes" element={<PlansPage />} />
            <Route path="planes/nueva" element={<PlanFormPage />} />
            <Route path="planes/:id" element={<PlanDetailPage />} />
            <Route path="planes/:id/editar" element={<PlanFormPage />} />
            <Route path="actividades" element={<ActivitiesPage />} />
            <Route path="actividades/nueva" element={<ActivityFormPage />} />
            <Route path="actividades/:id" element={<ActivityDetailPage />} />
            <Route path="evaluaciones" element={<AssessmentsPage />} />
            <Route path="evaluaciones/nueva" element={<AssessmentFormPage />} />
            <Route path="evaluaciones/:id" element={<AssessmentDetailPage />} />
            <Route path="asistente" element={<AssistantPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
