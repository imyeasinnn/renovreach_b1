'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useDismissable } from '@/hooks/use-dismissable'
import { useActiveOrganizationId, useOrganizations } from '@/services/hooks'
import { switchOrganization } from '@/services/organizations'
import { useToast } from '@/components/ui/toast'
import { initials } from '@/lib/format'
import { cn } from '@/lib/cn'

export function OrgSwitcher({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const organizations = useOrganizations()
  const activeId = useActiveOrganizationId()
  const toast = useToast()
  const ref = useDismissable(open, () => onOpenChange(false))
  const active = organizations.find((org) => org.id === activeId)

  function select(orgId: string, name: string) {
    if (orgId === activeId) {
      onOpenChange(false)
      return
    }
    switchOrganization(orgId)
    onOpenChange(false)
    toast({ title: `Switched to ${name}`, description: 'Dashboard and data now reflect this organization.' })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Switch organization"
        className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface/80 py-1 pl-1 pr-2 text-left transition-colors hover:border-line-strong hover:bg-surface-hover sm:pr-2.5"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-[10.5px] font-semibold text-accent-soft">
          {active ? initials(active.name) : 'RR'}
        </span>
        <span className="hidden max-w-[150px] truncate text-[12.5px] font-medium text-fg sm:inline">
          {active?.name ?? 'Organization'}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-faint" aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Organizations"
          className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(300px,calc(100vw-1.5rem))] animate-pop-in rounded-2xl border border-line-strong bg-surface p-1.5 shadow-2xl"
        >
          <p className="px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-faint">
            Organizations
          </p>
          {organizations.map((org) => {
            const selected = org.id === activeId
            return (
              <button
                key={org.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => select(org.id, org.name)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/[0.05]',
                  selected && 'bg-accent/8',
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[11px] font-semibold text-fg">
                  {initials(org.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-fg">{org.name}</span>
                  <span className="block text-[11px] text-faint">
                    Owner · {org.timezone}
                  </span>
                </span>
                {selected ? <Check className="size-4 text-accent" aria-hidden /> : null}
              </button>
            )
          })}
          <p className="border-t border-line px-2.5 pb-1.5 pt-2 text-[11px] leading-5 text-faint">
            Switching organizations changes every screen. This is demo data only.
          </p>
        </div>
      ) : null}
    </div>
  )
}
