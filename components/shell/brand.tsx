import { cn } from '@/lib/cn'

/**
 * Placeholder logo. Swap the mark and wordmark here when final branding lands.
 */
export function Brand({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-accent to-accent-strong shadow-[0_8px_22px_-10px_rgba(16,185,129,0.9)]">
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="size-5 text-[#04170f]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11 12 4l9 7" />
          <path d="M6 10v9h12v-9" />
        </svg>
      </span>
      {compact ? null : (
        <span className="truncate text-[15.5px] font-semibold tracking-tight text-fg">
          Renov<span className="text-accent-soft">Reach</span>
        </span>
      )}
    </span>
  )
}
