import type { ReactNode } from 'react'

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export function RichText({ text }: { text: string }) {
  const lines = text.split(/\r?\n/)

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmed = line.trim()

        if (!trimmed) return <div key={index} className="h-2" aria-hidden="true" />

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={index} className="pt-2 text-sm font-bold text-brand-900">
              {renderInline(trimmed.slice(4))}
            </h4>
          )
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={index} className="pt-3 text-base font-bold text-brand-950 first:pt-0">
              {renderInline(trimmed.slice(3))}
            </h3>
          )
        }

        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={index} className="pt-3 text-lg font-bold text-brand-950 first:pt-0">
              {renderInline(trimmed.slice(2))}
            </h2>
          )
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={index} className="flex gap-2 pl-1 text-sm leading-6 text-slate-600">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              <p>{renderInline(trimmed.slice(2))}</p>
            </div>
          )
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const [number, ...rest] = trimmed.split(' ')
          return (
            <div key={index} className="flex gap-2.5 pl-1 text-sm leading-6 text-slate-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-700">
                {number.replace('.', '')}
              </span>
              <p>{renderInline(rest.join(' '))}</p>
            </div>
          )
        }

        return (
          <p key={index} className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {renderInline(trimmed)}
          </p>
        )
      })}
    </div>
  )
}
