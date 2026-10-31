import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '../components/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Compass className="h-8 w-8" />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Error 404</p>
      <h1 className="mt-2 text-2xl font-bold text-brand-950">No encontramos esta página</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        La dirección puede estar incorrecta o el contenido fue movido. Vuelve al panel para continuar.
      </p>
      <Link to="/" className={buttonClasses('primary', 'md', 'mt-6')}>
        <ArrowLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>
    </div>
  )
}
