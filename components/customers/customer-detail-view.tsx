'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Archive,
  ArrowLeft,
  Briefcase,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { CustomerForm } from '@/components/customers/customer-form'
import { archiveCustomer, useCustomerDetail } from '@/services/customers'
import { formatDate, formatDateTime, formatPhone } from '@/lib/format'

const purposeLabels: Record<string, string> = {
  review_request: 'Review request',
  promotional: 'Promotional',
  transactional: 'Transactional',
}

function stateLabel(state: 'granted' | 'not_granted' | 'opted_out') {
  if (state === 'granted') return 'Granted'
  if (state === 'opted_out') return 'Opted out'
  return 'Not granted'
}

function stateTone(state: 'granted' | 'not_granted' | 'opted_out') {
  if (state === 'granted') return 'accent'
  if (state === 'opted_out') return 'danger'
  return 'muted'
}

export function CustomerDetailView({ customerId }: { customerId: string }) {
  const detail = useCustomerDetail(customerId)
  const router = useRouter()
  const toast = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  if (!detail) {
    return (
      <div>
        <Link
          href="/customers"
          className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted hover:text-fg"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Customers
        </Link>
        <EmptyState
          icon={Users}
          title="Customer not found"
          description="This person may have been archived, or the link belongs to another organization."
          action={
            <Link href="/customers" className="text-[12.5px] font-medium text-accent-soft hover:text-accent">
              Back to customers
            </Link>
          }
        />
      </div>
    )
  }

  const { customer, jobs, messages, consents, location_name, sms_consent, email_consent } = detail
  const fullName = `${customer.first_name} ${customer.last_name}`
  const promoConsent = (() => {
    const latest = consents
      .filter((item) => item.purpose === 'promotional' && item.channel === 'sms')
      .sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime())[0]
    if (!latest) return 'not_granted' as const
    return latest.status === 'granted' ? ('granted' as const) : ('opted_out' as const)
  })()

  return (
    <div>
      <Link
        href="/customers"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted hover:text-fg"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Customers
      </Link>

      <PageHeader
        title={fullName}
        description={`${location_name} · Added ${formatDate(customer.created_at)}`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" aria-hidden />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setArchiveOpen(true)}>
              <Archive className="size-3.5" aria-hidden />
              Archive
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        <Badge tone={stateTone(sms_consent)}>SMS · {stateLabel(sms_consent)}</Badge>
        <Badge tone={stateTone(email_consent)}>Email · {stateLabel(email_consent)}</Badge>
        {customer.tags.map((tag) => (
          <Badge key={tag} tone="outline">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader title="Contact" description="How this customer is reached." />
            <dl className="mt-2 divide-y divide-line/60 px-5 pb-2">
              <div className="flex items-center gap-3 py-3">
                <dt className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-ink/40 text-muted">
                  <Phone className="size-3.5" aria-hidden />
                  <span className="sr-only">Phone</span>
                </dt>
                <dd className="min-w-0 flex-1 text-[13px] text-fg">{formatPhone(customer.phone_e164)}</dd>
              </div>
              <div className="flex items-center gap-3 py-3">
                <dt className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-ink/40 text-muted">
                  <Mail className="size-3.5" aria-hidden />
                  <span className="sr-only">Email</span>
                </dt>
                <dd className="min-w-0 flex-1 truncate text-[13px] text-fg">{customer.email ?? 'No email'}</dd>
              </div>
              <div className="flex items-center gap-3 py-3">
                <dt className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-ink/40 text-muted">
                  <MapPin className="size-3.5" aria-hidden />
                  <span className="sr-only">Location</span>
                </dt>
                <dd className="min-w-0 flex-1 text-[13px] text-fg">{location_name}</dd>
              </div>
              <div className="flex items-center gap-3 py-3">
                <dt className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-ink/40 text-muted">
                  <Briefcase className="size-3.5" aria-hidden />
                  <span className="sr-only">Source</span>
                </dt>
                <dd className="min-w-0 flex-1 text-[13px] capitalize text-fg">
                  {customer.source === 'import' ? 'CSV import' : customer.source}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Job history" description={`${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} on record`} />
            {jobs.length === 0 ? (
              <p className="px-5 pb-5 text-[13px] text-muted">No jobs yet.</p>
            ) : (
              <ul className="mt-1 divide-y divide-line/60 px-5 pb-2">
                {jobs.map((job) => (
                  <li key={job.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-fg">{job.service_type}</p>
                      <p className="text-[11.5px] text-faint">
                        {job.completed_at
                          ? `Completed ${formatDate(job.completed_at)}`
                          : `Scheduled ${formatDate(job.scheduled_for)}`}
                      </p>
                    </div>
                    <StatusBadge status={job.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Message history" description="Every SMS and email, inbound and outbound." />
            {messages.length === 0 ? (
              <p className="px-5 pb-5 text-[13px] text-muted">No messages yet. A completed job starts the flow.</p>
            ) : (
              <ul className="mt-1 space-y-3 px-5 pb-5">
                {messages.map((message) => (
                  <li key={message.id} className="flex gap-3">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-line bg-ink/40 text-muted">
                      <MessageSquare className="size-3.5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 rounded-xl border border-line bg-ink/30 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="outline">{message.channel.toUpperCase()}</Badge>
                        <Badge tone={message.direction === 'inbound' ? 'info' : 'muted'}>
                          {message.direction === 'inbound' ? 'Inbound' : 'Outbound'}
                        </Badge>
                        <StatusBadge status={message.status} dot={false} />
                        <span className="ml-auto text-[10.5px] text-faint">
                          {formatDateTime(message.created_at)}
                        </span>
                      </div>
                      <p className="mt-2 text-[12.5px] leading-5 text-muted">{message.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Consent" description="Separate permission per channel and purpose." />
            <dl className="px-5 pb-4">
              <div className="flex items-center justify-between gap-2 border-b border-line/60 py-3">
                <dt className="text-[12.5px] text-muted">SMS review requests</dt>
                <dd>
                  <Badge tone={stateTone(sms_consent)} dot>
                    {stateLabel(sms_consent)}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-line/60 py-3">
                <dt className="text-[12.5px] text-muted">Email review requests</dt>
                <dd>
                  <Badge tone={stateTone(email_consent)} dot>
                    {stateLabel(email_consent)}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 py-3">
                <dt className="text-[12.5px] text-muted">SMS promotional</dt>
                <dd>
                  <Badge tone={stateTone(promoConsent)} dot>
                    {stateLabel(promoConsent)}
                  </Badge>
                </dd>
              </div>
            </dl>
            <p className="mx-5 mb-4 flex items-start gap-1.5 rounded-lg bg-ink/40 px-2.5 py-2 text-[11px] leading-4 text-faint">
              <ShieldCheck className="mt-0.5 size-3 shrink-0 text-accent" aria-hidden />
              Review-request consent never implies promotional consent. Opt-outs are honored everywhere.
            </p>
          </Card>

          <Card>
            <CardHeader title="Consent history" description="Append-only. Newest first." />
            {consents.length === 0 ? (
              <p className="px-5 pb-5 text-[13px] text-muted">No consent records yet.</p>
            ) : (
              <ol className="mt-1 space-y-3 px-5 pb-5">
                {consents.map((consent) => (
                  <li key={consent.id} className="rounded-xl border border-line bg-ink/30 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="outline">{consent.channel.toUpperCase()}</Badge>
                      <span className="text-[11.5px] text-muted">
                        {purposeLabels[consent.purpose] ?? consent.purpose}
                      </span>
                      <StatusBadge status={consent.status} dot={false} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-faint">
                      {formatDate(consent.captured_at)} · {consent.source}
                    </p>
                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-[11px] font-medium text-accent-soft hover:text-accent">
                        Wording shown
                      </summary>
                      <blockquote className="mt-1.5 border-l-2 border-accent/30 pl-2.5 text-[11px] leading-5 text-muted">
                        {consent.wording_text}
                        <span className="mt-1 block text-[10px] text-faint">
                          Version {consent.wording_version}
                        </span>
                      </blockquote>
                    </details>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      <CustomerForm open={editOpen} customer={customer} onClose={() => setEditOpen(false)} />

      <ConfirmModal
        open={archiveOpen}
        title={`Archive ${fullName}?`}
        description="They will be removed from the customer list. Consent history and messages are kept, and this is a soft delete."
        confirmLabel="Archive customer"
        onConfirm={() => {
          archiveCustomer(customer.id)
          toast({
            title: 'Customer archived',
            description: `${fullName} was archived. History was kept.`,
          })
          router.push('/customers')
        }}
        onClose={() => setArchiveOpen(false)}
      />
    </div>
  )
}
