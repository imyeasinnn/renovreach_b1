import Link from 'next/link'
import { Hammer } from 'lucide-react'
import { buttonClasses } from '@/components/ui/button'

/**
 * Temporary page body for the screens that arrive in later build steps.
 * Each of these routes is replaced by the real screen in its group.
 */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface/40 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full border border-line bg-surface-raised text-accent-soft">
        <Hammer className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-[15px] font-semibold text-fg">{title} arrives in the next build step</p>
      <p className="mt-1 max-w-sm text-[13px] leading-6 text-muted">
        The shell, dashboard, and data switching are ready for review. This screen is queued next so we can
        review it without rushing.
      </p>
      <Link href="/dashboard" className={buttonClasses('secondary', 'sm', 'mt-5')}>
        Back to dashboard
      </Link>
    </div>
  )
}
