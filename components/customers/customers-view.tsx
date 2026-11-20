'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Archive,
  Pencil,
  Search,
  Send,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { DataTable, type SortState, type TableColumn } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { ConsentBadge } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast'
import { CustomerForm } from '@/components/customers/customer-form'
import { ImportWizard } from '@/components/customers/import-wizard'
import { ChannelConsent } from '@/components/customers/channel-consent'
import { archiveCustomer, useCustomerRows, type CustomerRow } from '@/services/customers'
import { formatPhone, formatShortDate } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { Customer } from '@/types'

type ConsentFilter = 'all' | 'granted' | 'opted_out'

export function CustomersView() {
  const rows = useCustomerRows()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [consentFilter, setConsentFilter] = useState<ConsentFilter>('all')
  const [sort, setSort] = useState<SortState>({ key: 'name', direction: 'asc' })
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [archiving, setArchiving] = useState<Customer | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 500)
    return () => window.clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    const result = rows.filter((row) => {
      const matchesQuery =
        !term ||
        `${row.first_name} ${row.last_name}`.toLowerCase().includes(term) ||
        (row.phone_e164 ?? '').includes(term) ||
        (row.email ?? '').toLowerCase().includes(term) ||
        row.tags.some((tag) => tag.toLowerCase().includes(term))

      const matchesConsent =
        consentFilter === 'all' ||
        (consentFilter === 'granted' && (row.sms_consent === 'granted' || row.email_consent === 'granted')) ||
        (consentFilter === 'opted_out' && (row.sms_consent === 'opted_out' || row.email_consent === 'opted_out'))

      return matchesQuery && matchesConsent
    })

    return result.sort((a, b) => {
      if (sort.key === 'last_job') {
        const aTime = a.last_job_at ? new Date(a.last_job_at).getTime() : 0
        const bTime = b.last_job_at ? new Date(b.last_job_at).getTime() : 0
        return sort.direction === 'asc' ? aTime - bTime : bTime - aTime
      }
      const aName = `${a.last_name} ${a.first_name}`.toLowerCase()
      const bName = `${b.last_name} ${b.first_name}`.toLowerCase()
      return sort.direction === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName)
    })
  }, [rows, query, consentFilter, sort])

  const selectable = filtered.filter(
    (row) => row.sms_consent === 'granted' || row.email_consent === 'granted',
  )
  const allSelected = selectable.length > 0 && selectable.every((row) => selected.has(row.id))

  function toggleSort(key: string) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )
  }

  function toggleRow(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((current) => {
      if (allSelected) return new Set()
      return new Set([...current, ...selectable.map((row) => row.id)])
    })
  }

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(customer: Customer) {
    setEditing(customer)
    setFormOpen(true)
  }

  const columns: TableColumn<CustomerRow>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          aria-label="Select all customers with consent"
          checked={allSelected}
          onChange={toggleAll}
          className="size-4 accent-[#10b981]"
        />
      ),
      headerClassName: 'w-10',
      cell: (row) => {
        const canSelect = row.sms_consent === 'granted' || row.email_consent === 'granted'
        return (
          <input
            type="checkbox"
            aria-label={`Select ${row.first_name} ${row.last_name}`}
            checked={selected.has(row.id)}
            disabled={!canSelect}
            title={canSelect ? undefined : 'No SMS or email consent — cannot be selected'}
            onChange={() => toggleRow(row.id)}
            className="size-4 accent-[#10b981] disabled:cursor-not-allowed disabled:opacity-40"
          />
        )
      },
    },
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      cell: (row) => (
        <div className="min-w-0">
          <Link
            href={`/customers/${row.id}`}
            className="font-medium text-fg hover:text-accent-soft hover:underline"
          >
            {row.first_name} {row.last_name}
          </Link>
          {row.tags.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {row.tags.map((tag) => (
                <Badge key={tag} tone="outline" className="px-1.5 py-0 text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (row) => (
        <span className={cn('whitespace-nowrap', row.phone_e164 ? 'text-muted' : 'text-faint')}>
          {formatPhone(row.phone_e164)}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      cell: (row) => (
        <span className="block max-w-[190px] truncate text-muted">{row.email ?? '—'}</span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      cell: (row) => <span className="whitespace-nowrap text-muted">{row.location_name}</span>,
    },
    {
      key: 'last_job',
      header: 'Last job',
      sortable: true,
      cell: (row) => (
        <span className="whitespace-nowrap text-muted">
          {row.last_job_at ? formatShortDate(row.last_job_at) : '—'}
        </span>
      ),
    },
    {
      key: 'sms_consent',
      header: 'SMS consent',
      cell: (row) => <ConsentBadge state={row.sms_consent} />,
    },
    {
      key: 'email_consent',
      header: 'Email consent',
      cell: (row) => <ConsentBadge state={row.email_consent} />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headerClassName: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(row)}
            aria-label={`Edit ${row.first_name} ${row.last_name}`}
            className="grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-white/5 hover:text-fg"
          >
            <Pencil className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setArchiving(row)}
            aria-label={`Archive ${row.first_name} ${row.last_name}`}
            className="grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Archive className="size-3.5" aria-hidden />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Everyone you serve, with SMS and email consent in one place."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="size-4" aria-hidden />
              Import
            </Button>
            <Button size="sm" onClick={openAdd}>
              <UserPlus className="size-4" aria-hidden />
              Add customer
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone, email, or tag"
              aria-label="Search customers"
              className="h-10 w-full rounded-xl border border-line bg-ink/40 pl-9 pr-3 text-[13px] text-fg placeholder:text-faint focus:border-accent/50 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-faint hover:bg-white/5 hover:text-fg"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            ) : null}
          </div>

          <select
            value={consentFilter}
            onChange={(event) => setConsentFilter(event.target.value as ConsentFilter)}
            aria-label="Filter by consent"
            className="h-10 rounded-xl border border-line bg-ink/40 px-3 text-[12.5px] text-muted focus:border-accent/50 focus:outline-none"
          >
            <option value="all">All consent states</option>
            <option value="granted">Has consent</option>
            <option value="opted_out">Opted out</option>
          </select>

          <p className="px-1 text-[11.5px] text-faint sm:ml-1 sm:whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'}
          </p>
        </div>

        {selected.size > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-accent/20 bg-accent/[0.06] px-3 py-2">
            <span className="text-[12px] font-medium text-accent-soft">
              {selected.size} selected
            </span>
            <span className="text-[11px] text-faint">
              Opted-out customers are never selectable.
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  toast({
                    title: `${selected.size} review requests queued`,
                    description: 'Sending is simulated in this mockup — nothing leaves the browser.',
                  })
                  setSelected(new Set())
                }}
              >
                <Send className="size-3.5" aria-hidden />
                Send review request
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          </div>
        ) : null}

        <DataTable
          ariaLabel="Customers"
          columns={columns}
          rows={filtered}
          rowKey={(row) => row.id}
          sort={sort}
          onSortChange={toggleSort}
          loading={loading}
          mobileCard={(row) => (
            <div className="p-3.5">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  aria-label={`Select ${row.first_name} ${row.last_name}`}
                  checked={selected.has(row.id)}
                  disabled={row.sms_consent !== 'granted' && row.email_consent !== 'granted'}
                  onChange={() => toggleRow(row.id)}
                  className="mt-1 size-4 accent-[#10b981] disabled:cursor-not-allowed disabled:opacity-40"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/customers/${row.id}`}
                    className="text-[14px] font-semibold text-fg hover:text-accent-soft"
                  >
                    {row.first_name} {row.last_name}
                  </Link>
                  <p className="mt-0.5 truncate text-[12px] text-muted">
                    {formatPhone(row.phone_e164)} · {row.email ?? 'No email'}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-faint">
                    {row.location_name} · Last job {row.last_job_at ? formatShortDate(row.last_job_at) : '—'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <ChannelConsent label="SMS" state={row.sms_consent} />
                    <ChannelConsent label="Email" state={row.email_consent} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    aria-label={`Edit ${row.first_name} ${row.last_name}`}
                    className="grid size-8 place-items-center rounded-lg text-faint hover:bg-white/5 hover:text-fg"
                  >
                    <Pencil className="size-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setArchiving(row)}
                    aria-label={`Archive ${row.first_name} ${row.last_name}`}
                    className="grid size-8 place-items-center rounded-lg text-faint hover:bg-danger/10 hover:text-danger"
                  >
                    <Archive className="size-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          )}
          empty={
            <EmptyState
              icon={Users}
              title={query || consentFilter !== 'all' ? 'No customers match' : 'No customers yet'}
              description={
                query || consentFilter !== 'all'
                  ? 'Try a different search or consent filter.'
                  : 'Add your first customer or import a list to get started.'
              }
              action={
                query || consentFilter !== 'all' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setQuery('')
                      setConsentFilter('all')
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button size="sm" onClick={openAdd}>
                    Add customer
                  </Button>
                )
              }
            />
          }
        />
      </Card>

      <CustomerForm open={formOpen} customer={editing} onClose={() => setFormOpen(false)} />

      <ConfirmModal
        open={Boolean(archiving)}
        title={archiving ? `Archive ${archiving.first_name} ${archiving.last_name}?` : 'Archive customer?'}
        description="They will be removed from the customer list. Consent history and messages are kept, and this is a soft delete."
        confirmLabel="Archive customer"
        onConfirm={() => {
          if (!archiving) return
          archiveCustomer(archiving.id)
          setSelected((current) => {
            const next = new Set(current)
            next.delete(archiving.id)
            return next
          })
          toast({
            title: 'Customer archived',
            description: `${archiving.first_name} ${archiving.last_name} was archived. History was kept.`,
          })
        }}
        onClose={() => setArchiving(null)}
      />

      <ImportWizard open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
