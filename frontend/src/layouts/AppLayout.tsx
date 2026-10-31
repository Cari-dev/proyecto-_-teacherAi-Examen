import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useApiResource } from '../hooks/useApiResource'
import type { HealthResponse } from '../types'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const health = useApiResource<HealthResponse>('/health')
  const online = Boolean(health.data) && !health.error

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        online={online}
        assistantMode={health.data?.assistant_mode}
      />
      <div className="lg:pl-[272px]">
        <Header onOpenSidebar={() => setSidebarOpen(true)} assistantMode={health.data?.assistant_mode} />
        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <Outlet />
        </main>
        <footer className="mx-auto max-w-7xl px-4 pb-6 text-center text-[11px] text-slate-400 sm:px-6 lg:px-8">
          TeacherAI · Proyecto universitario · FastAPI + React
        </footer>
      </div>
    </div>
  )
}
