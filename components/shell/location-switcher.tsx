'use client'

import { Check, ChevronDown, MapPin } from 'lucide-react'
import { useDismissable } from '@/hooks/use-dismissable'
import { useActiveLocationFilter, useLocations } from '@/services/hooks'
import { switchLocation } from '@/services/organizations'
import { cn } from '@/lib/cn'

export function LocationSwitcher({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const locations = useLocations()
  const activeId = useActiveLocationFilter()
  const ref = useDismissable(open, () => onOpenChange(false))
  const label = activeId === 'all' ? 'All locations' : locations.find((l) => l.id === activeId)?.name

  function select(id: string) {
    switchLocation(id)
    onOpenChange(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Filter by location"
        className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface/80 px-2.5 text-[12.5px] font-medium text-muted transition-colors hover:border-line-strong hover:bg-surface-hover hover:text-fg"
      >
        <MapPin className="size-3.5 text-faint" aria-hidden />
        <span className="hidden max-w-[110px] truncate md:inline">{label}</span>
        <ChevronDown className="hidden size-3 text-faint sm:block" aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Locations"
          className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(250px,calc(100vw-1.5rem))] animate-pop-in rounded-2xl border border-line-strong bg-surface p-1.5 shadow-2xl"
        >
          <p className="px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-faint">
            Filter by location
          </p>
          {[{ id: 'all', name: 'All locations' }, ...locations].map((location) => {
            const selected = location.id === activeId
            return (
              <button
                key={location.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => select(location.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.05]',
                  selected ? 'bg-accent/8 text-fg' : 'text-muted',
                )}
              >
                <span className="flex-1 truncate">{location.name}</span>
                {selected ? <Check className="size-4 text-accent" aria-hidden /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
