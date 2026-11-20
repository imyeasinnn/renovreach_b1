import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'accent',
  loading = false,
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: 'accent' | 'info' | 'warn'
  loading?: boolean
}) {
  if (loading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="mt-4 h-3 w-24" />
        <Skeleton className="mt-2.5 h-7 w-16" />
      </Card>
    )
  }

  return (
    <Card className="p-5 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-medium text-muted">{label}</p>
        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-xl border',
            tone === 'accent' && 'border-accent/20 bg-accent/10 text-accent-soft',
            tone === 'info' && 'border-info/20 bg-info/10 text-info',
            tone === 'warn' && 'border-warn/20 bg-warn/10 text-warn',
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight text-fg">{value}</p>
      {hint ? <p className="mt-2 text-[12px] text-faint">{hint}</p> : null}
    </Card>
  )
}
