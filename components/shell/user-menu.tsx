'use client'

import { ChevronDown, LogOut, RotateCcw, ShieldCheck } from 'lucide-react'
import { useDismissable } from '@/hooks/use-dismissable'
import { useToast } from '@/components/ui/toast'
import { useCurrentMembership } from '@/services/hooks'
import { resetDemoData } from '@/services/organizations'
import { demoUser } from '@/mock-data'
import { initials } from '@/lib/format'

/** Owner-only demo: there is deliberately no role switcher. */
export function UserMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const membership = useCurrentMembership()
  const toast = useToast()
  const ref = useDismissable(open, () => onOpenChange(false))
  const name = membership?.full_name ?? demoUser.full_name
  const email = membership?.email ?? demoUser.email

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label="Open user menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface/80 pl-1 pr-1.5 transition-colors hover:border-line-strong hover:bg-surface-hover sm:pr-2"
      >
        <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 text-[10.5px] font-semibold text-accent-soft">
          {initials(name)}
        </span>
        <ChevronDown className="hidden size-3 text-faint sm:block" aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(290px,calc(100vw-1.5rem))] animate-pop-in overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-[13px] font-semibold text-fg">{name}</p>
            <p className="truncate text-[11.5px] text-faint">{email}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10.5px] font-medium text-accent-soft">
              <ShieldCheck className="size-3" aria-hidden />
              Owner · full access
            </span>
          </div>

          <div className="p-1.5">
            <button
              type="button"
              onClick={() => {
                resetDemoData()
                onOpenChange(false)
                toast({
                  title: 'Demo data reset',
                  description: 'All sample records are back to their starting state.',
                })
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-muted transition-colors hover:bg-white/[0.05] hover:text-fg"
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset demo data
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false)
                toast({
                  title: 'Sign out',
                  description: 'Authentication is not connected in this mockup.',
                  tone: 'info',
                })
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-muted transition-colors hover:bg-white/[0.05] hover:text-fg"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
