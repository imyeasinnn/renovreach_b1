'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastTone = 'success' | 'error' | 'info'

interface ToastInput {
  title: string
  description?: string
  tone?: ToastTone
}

interface ToastItem extends ToastInput {
  id: number
}

const ToastContext = createContext<{ toast: (input: ToastInput) => void } | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context.toast
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++
      setToasts((current) => [...current.slice(-2), { ...input, id }])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-20 right-4 z-[90] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 lg:bottom-6"
      >
        {toasts.map((item) => {
          const tone = item.tone ?? 'success'
          const Icon = tone === 'error' ? AlertTriangle : tone === 'info' ? Info : CheckCircle2
          return (
            <div
              key={item.id}
              role="status"
              className="pointer-events-auto flex animate-toast-in items-start gap-3 rounded-xl border border-line-strong bg-surface-raised/95 p-3 pr-2 shadow-2xl backdrop-blur"
            >
              <Icon
                className={cn(
                  'mt-0.5 size-4 shrink-0',
                  tone === 'error' ? 'text-danger' : tone === 'info' ? 'text-info' : 'text-accent',
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-fg">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 text-[12px] leading-5 text-muted">{item.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="grid size-7 shrink-0 place-items-center rounded-full text-faint hover:bg-white/5 hover:text-fg"
                aria-label="Dismiss notification"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
