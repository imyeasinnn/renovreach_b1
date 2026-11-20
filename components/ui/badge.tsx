import { cn } from '@/lib/cn'

export type BadgeTone = 'accent' | 'muted' | 'warn' | 'danger' | 'info' | 'outline'

const tones: Record<BadgeTone, string> = {
  accent: 'border-accent/25 bg-accent/12 text-accent-soft',
  muted: 'border-line-strong bg-white/[0.04] text-muted',
  warn: 'border-warn/25 bg-warn/10 text-warn',
  danger: 'border-danger/25 bg-danger/10 text-danger',
  info: 'border-info/25 bg-info/10 text-info',
  outline: 'border-line-strong bg-transparent text-muted',
}

export function Badge({
  children,
  tone = 'muted',
  className,
  dot = false,
}: {
  children: React.ReactNode
  tone?: BadgeTone
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11.5px] font-medium leading-5',
        tones[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  )
}
