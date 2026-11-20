'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  MessageSquareText,
  Pencil,
  PhoneOff,
  Send,
  Star,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { ReviewsChart } from '@/components/dashboard/reviews-chart'
import { RequestsChart } from '@/components/dashboard/requests-chart'
import { useDashboardSnapshot } from '@/services/dashboard'
import { activityCopy } from '@/lib/activity'
import { formatDate, timeAgo } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { ActivityLog } from '@/types'

const activityIcons: Record<ActivityLog['action'], typeof Briefcase> = {
  'job.completed': Briefcase,
  'request.sent': Send,
  'request.failed': AlertTriangle,
  'review.received': Star,
  'customer.opted_out': MessageSquareText,
  'customer.created': UserPlus,
  'customer.updated': Pencil,
  'customer.archived': Archive,
  'customers.imported': Users,
  'location.created': Users,
}

const activityTones: Record<ActivityLog['action'], string> = {
  'job.completed': 'border-accent/20 bg-accent/10 text-accent-soft',
  'request.sent': 'border-info/20 bg-info/10 text-info',
  'request.failed': 'border-danger/20 bg-danger/10 text-danger',
  'review.received': 'border-warn/20 bg-warn/10 text-warn',
  'customer.opted_out': 'border-line-strong bg-white/[0.04] text-muted',
  'customer.created': 'border-accent/20 bg-accent/10 text-accent-soft',
  'customer.updated': 'border-line-strong bg-white/[0.04] text-muted',
  'customer.archived': 'border-line-strong bg-white/[0.04] text-muted',
  'customers.imported': 'border-accent/20 bg-accent/10 text-accent-soft',
  'location.created': 'border-line-strong bg-white/[0.04] text-muted',
}

export function DashboardView() {
  const snapshot = useDashboardSnapshot()
  const toast = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650)
    return () => window.clearTimeout(timer)
  }, [])

  const { kpis, attention, reviewSeries, requestSeries, activity, organization, locationLabel } = snapshot

  function mockQuickAction(label: string) {
    toast({
      title: `${label} is next`,
      description: 'This quick action is wired up in the next build step.',
      tone: 'info',
    })
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          organization
            ? `${organization.name} · ${locationLabel} — your review engine at a glance.`
            : 'Your review engine at a glance.'
        }
        actions={<Badge tone="outline">Last 30 days</Badge>}
      />

      <section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Jobs completed"
          value={String(kpis.jobsCompleted)}
          hint="This calendar month"
          icon={CheckCircle2}
          loading={loading}
        />
        <KpiCard
          label="Review requests sent"
          value={String(kpis.requestsSent)}
          hint={`${kpis.requestsDelivered} delivered`}
          icon={Send}
          loading={loading}
        />
        <KpiCard
          label="Reviews received"
          value={String(kpis.reviewsReceived)}
          hint={`${kpis.newReviews} awaiting a reply`}
          icon={MessageSquareText}
          loading={loading}
        />
        <KpiCard
          label="Average rating"
          value={kpis.averageRating ? kpis.averageRating.toFixed(1) : '—'}
          hint={kpis.averageRating ? 'Out of 5 stars' : 'No reviews yet'}
          icon={Star}
          tone="warn"
          loading={loading}
        />
        <KpiCard
          label="Credits remaining"
          value={String(kpis.creditsRemaining)}
          hint={`of ${kpis.creditsIncluded} this month`}
          icon={Zap}
          tone="info"
          loading={loading}
        />
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card className="min-w-0">
          <CardHeader
            title="Reviews received"
            description="Google reviews per day over the last 30 days"
            action={<Badge tone="accent">+{kpis.reviewsReceived} this month</Badge>}
          />
          <div className="mt-2 px-3 pb-4">
            {loading ? <Skeleton className="h-[230px] w-full" /> : <ReviewsChart data={reviewSeries} />}
          </div>
        </Card>

        <Card className="min-w-0">
          <CardHeader
            title="Requests sent vs delivered"
            description="SMS and email combined"
            action={
              <span className="flex items-center gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-accent" aria-hidden /> Sent
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-accent-soft" aria-hidden /> Delivered
                </span>
              </span>
            }
          />
          <div className="mt-2 px-3 pb-4">
            {loading ? <Skeleton className="h-[230px] w-full" /> : <RequestsChart data={requestSeries} />}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader
            title="Recent activity"
            description="Jobs, requests, and reviews as they happen"
            action={
              <Link
                href="/activity"
                className="inline-flex items-center gap-0.5 text-[12px] font-medium text-accent-soft hover:text-accent"
              >
                View all <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            }
          />
          {loading ? (
            <div className="space-y-2 p-5">
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-12 w-full" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="p-5 text-sm text-muted">No activity yet. Complete a job to start the flow.</p>
          ) : (
            <ul className="mt-1 px-3 pb-3">
              {activity.map((entry) => {
                const Icon = activityIcons[entry.action]
                const copy = activityCopy(entry)
                return (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[0.03]"
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border',
                        activityTones[entry.action],
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-fg">{copy.title}</p>
                      <p className="truncate text-[12px] text-muted">{copy.detail}</p>
                    </div>
                    <time
                      className="shrink-0 pt-0.5 text-[11px] text-faint"
                      dateTime={entry.created_at}
                      title={formatDate(entry.created_at)}
                    >
                      {timeAgo(entry.created_at)}
                    </time>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Needs attention" description="Quick fixes that protect your review flow" />
            <div className="p-2.5">
              <AttentionRow
                href="/review-requests"
                icon={AlertTriangle}
                label="Failed messages"
                count={attention.failedRequests}
                tone={attention.failedRequests > 0 ? 'danger' : 'muted'}
              />
              <AttentionRow
                href="/customers"
                icon={PhoneOff}
                label="Customers without a phone"
                count={attention.missingPhone}
                tone={attention.missingPhone > 0 ? 'warn' : 'muted'}
              />
              <AttentionRow
                href="/customers"
                icon={Users}
                label="Customers opted out"
                count={attention.optedOut}
                tone="muted"
              />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold text-fg">Quick actions</h2>
            <p className="mt-0.5 text-[12.5px] text-muted">Common tasks, one click away.</p>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                variant="secondary"
                className="justify-start"
                onClick={() => mockQuickAction('Add customer')}
              >
                <UserPlus className="size-4" aria-hidden />
                Add customer
              </Button>
              <Button
                variant="secondary"
                className="justify-start"
                onClick={() => mockQuickAction('Add job')}
              >
                <Briefcase className="size-4" aria-hidden />
                Add job
              </Button>
              <Button
                variant="secondary"
                className="justify-start"
                onClick={() => mockQuickAction('Import customers')}
              >
                <Users className="size-4" aria-hidden />
                Import customers
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AttentionRow({
  href,
  icon: Icon,
  label,
  count,
  tone,
}: {
  href: string
  icon: typeof Users
  label: string
  count: number
  tone: 'danger' | 'warn' | 'muted'
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-white/[0.04]"
    >
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-full border',
          tone === 'danger' && 'border-danger/20 bg-danger/10 text-danger',
          tone === 'warn' && 'border-warn/20 bg-warn/10 text-warn',
          tone === 'muted' && 'border-line-strong bg-white/[0.04] text-muted',
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="flex-1 text-[12.5px] font-medium text-fg">{label}</span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[11px] font-semibold',
          tone === 'danger' && 'bg-danger/12 text-danger',
          tone === 'warn' && 'bg-warn/12 text-warn',
          tone === 'muted' && 'bg-white/[0.06] text-muted',
        )}
      >
        {count}
      </span>
      <ChevronRight className="size-3.5 text-faint" aria-hidden />
    </Link>
  )
}
