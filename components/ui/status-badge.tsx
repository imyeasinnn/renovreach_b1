import { Badge, type BadgeTone } from '@/components/ui/badge'

const map: Record<string, { label: string; tone: BadgeTone }> = {
  scheduled: { label: 'Scheduled', tone: 'info' },
  in_progress: { label: 'In progress', tone: 'warn' },
  completed: { label: 'Completed', tone: 'accent' },
  sent: { label: 'Sent', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'accent' },
  failed: { label: 'Failed', tone: 'danger' },
  skipped_no_consent: { label: 'Skipped · no consent', tone: 'muted' },
  skipped_opted_out: { label: 'Skipped · opted out', tone: 'muted' },
  queued: { label: 'Queued', tone: 'muted' },
  received: { label: 'Received', tone: 'info' },
  new: { label: 'New', tone: 'accent' },
  replied: { label: 'Replied', tone: 'muted' },
  draft: { label: 'Draft', tone: 'muted' },
  granted: { label: 'Granted', tone: 'accent' },
  withdrawn: { label: 'Withdrawn', tone: 'danger' },
  not_granted: { label: 'Not granted', tone: 'muted' },
  opted_out: { label: 'Opted out', tone: 'danger' },
}

export function StatusBadge({ status, dot = true }: { status: string; dot?: boolean }) {
  const entry = map[status] ?? { label: status, tone: 'muted' as BadgeTone }
  return (
    <Badge tone={entry.tone} dot={dot}>
      {entry.label}
    </Badge>
  )
}

export function ConsentBadge({ state }: { state: 'granted' | 'not_granted' | 'opted_out' }) {
  return <StatusBadge status={state} dot={false} />
}
