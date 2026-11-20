'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  Archive,
  Bell,
  Briefcase,
  MapPin,
  MessageSquareOff,
  Pencil,
  Send,
  Star,
  UserPlus,
  Users,
} from 'lucide-react'
import { useDismissable } from '@/hooks/use-dismissable'
import { useRecentActivity } from '@/services/hooks'
import { activityCopy } from '@/lib/activity'
import { timeAgo } from '@/lib/format'
import type { ActivityLog } from '@/types'

const icons: Record<ActivityLog['action'], typeof Bell> = {
  'job.completed': Briefcase,
  'request.sent': Send,
  'request.failed': AlertTriangle,
  'review.received': Star,
  'customer.opted_out': MessageSquareOff,
  'customer.created': UserPlus,
  'customer.updated': Pencil,
  'customer.archived': Archive,
  'customers.imported': Users,
  'location.created': MapPin,
}

const tones: Record<ActivityLog['action'], string> = {
  'job.completed': 'text-accent bg-accent/10',
  'request.sent': 'text-info bg-info/10',
  'request.failed': 'text-danger bg-danger/10',
  'review.received': 'text-warn bg-warn/10',
  'customer.opted_out': 'text-danger bg-danger/10',
  'customer.created': 'text-accent bg-accent/10',
  'customer.updated': 'text-muted bg-white/5',
  'customer.archived': 'text-muted bg-white/5',
  'customers.imported': 'text-accent bg-accent/10',
  'location.created': 'text-muted bg-white/5',
}

export function Notifications({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const activity = useRecentActivity(5)
  const ref = useDismissable(open, () => onOpenChange(false))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative grid size-9 place-items-center rounded-full border border-transparent text-muted transition-colors hover:border-line hover:bg-surface-hover hover:text-fg"
      >
        <Bell className="size-[18px]" aria-hidden />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent ring-2 ring-ink" aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Recent notifications"
          className="fixed inset-x-3 top-[68px] z-50 animate-pop-in overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-[340px]"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13px] font-semibold text-fg">Notifications</p>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10.5px] font-medium text-accent-soft">
              Last 5
            </span>
          </div>
          <ul className="max-h-[340px] overflow-y-auto p-1.5">
            {activity.map((entry) => {
              const Icon = icons[entry.action]
              const copy = activityCopy(entry)
              return (
                <li key={entry.id}>
                  <div className="flex items-start gap-2.5 rounded-xl px-2.5 py-2 hover:bg-white/[0.035]">
                    <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${tones[entry.action]}`}>
                      <Icon className="size-3.5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-medium text-fg">{copy.title}</p>
                      <p className="truncate text-[11.5px] text-muted">{copy.detail}</p>
                    </div>
                    <time className="shrink-0 text-[10.5px] text-faint" dateTime={entry.created_at}>
                      {timeAgo(entry.created_at)}
                    </time>
                  </div>
                </li>
              )
            })}
          </ul>
          <Link
            href="/activity"
            onClick={() => onOpenChange(false)}
            className="block border-t border-line px-4 py-2.5 text-center text-[12px] font-medium text-accent-soft hover:bg-accent/5"
          >
            View all activity
          </Link>
        </div>
      ) : null}
    </div>
  )
}
