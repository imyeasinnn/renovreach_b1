import type { ActivityLog } from '@/types'

/** Plain-language copy for the activity feed, bell, and activity page. */
export function activityCopy(entry: ActivityLog): { title: string; detail: string } {
  const customer = String(entry.metadata.customer ?? 'A customer')
  const channel = String(entry.metadata.channel ?? '')

  switch (entry.action) {
    case 'job.completed':
      return {
        title: 'Job completed',
        detail: `${customer} · ${String(entry.metadata.service ?? 'Service job')}`,
      }
    case 'request.sent':
      return { title: 'Review request sent', detail: `${customer}${channel ? ` · ${channel}` : ''}` }
    case 'request.failed':
      return { title: 'Message failed', detail: `${customer}${channel ? ` · ${channel}` : ''}` }
    case 'review.received':
      return {
        title: 'Review received',
        detail: `${customer} · ${String(entry.metadata.rating ?? 5)}-star Google review`,
      }
    case 'customer.opted_out':
      return { title: 'Customer opted out', detail: `${customer}${channel ? ` · ${channel}` : ''}` }
    case 'customer.created':
      return { title: 'Customer added', detail: customer }
    case 'customer.updated':
      return { title: 'Customer updated', detail: customer }
    case 'customer.archived':
      return { title: 'Customer archived', detail: customer }
    case 'customers.imported':
      return {
        title: 'Customers imported',
        detail: `${String(entry.metadata.count ?? 0)} rows added from a CSV file`,
      }
    case 'location.created':
      return { title: 'Location added', detail: String(entry.metadata.location ?? 'New location') }
    default:
      return { title: entry.action, detail: customer }
  }
}
