'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileSpreadsheet,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { importCustomers, type ImportReadyRow } from '@/services/customers'
import { cn } from '@/lib/cn'

interface SampleRow {
  rawName: string
  name: string
  rawPhone: string
  phone: string
  rawEmail: string
  email: string
  service: string
  status: 'ready' | 'duplicate' | 'attention'
  issue?: string
}

/** Fake spreadsheet rows used to demonstrate the import pipeline. */
const sampleRows: SampleRow[] = [
  {
    rawName: '  Darla   Whitfield ',
    name: 'Darla Whitfield',
    rawPhone: '(555) 010-0141',
    phone: '+15550100141',
    rawEmail: 'DANA.W@EXAMPLE.COM ',
    email: 'dana.w@example.com',
    service: 'Roof repair',
    status: 'ready',
  },
  {
    rawName: 'marco lee',
    name: 'Marco Lee',
    rawPhone: '555.010.0142',
    phone: '+15550100142',
    rawEmail: 'marcus.l@example.com',
    email: 'marcus.l@example.com',
    service: 'Gutter cleaning',
    status: 'ready',
  },
  {
    rawName: 'Priscilla  Raman',
    name: 'Priscilla Raman',
    rawPhone: '15550100143',
    phone: '+15550100143',
    rawEmail: 'PRIYA.RAMAN@EXAMPLE.COM',
    email: 'priya.raman@example.com',
    service: 'Inspection',
    status: 'ready',
  },
  {
    rawName: 'Tessa  Alvarez',
    name: 'Tessa Alvarez',
    rawPhone: '555 010 0144',
    phone: '+15550100144',
    rawEmail: 'tom.alvarez@example.com',
    email: 'tom.alvarez@example.com',
    service: 'Roof replacement',
    status: 'ready',
  },
  {
    rawName: 'Nina  Robinson',
    name: 'Nina Robinson',
    rawPhone: '(555) 010-0145',
    phone: '+15550100145',
    rawEmail: 'nia.robinson@example.com',
    email: 'nia.robinson@example.com',
    service: 'Leak repair',
    status: 'ready',
  },
  {
    rawName: ' Gavin  Palmer',
    name: 'Gavin Palmer',
    rawPhone: '555-010-0146',
    phone: '+15550100146',
    rawEmail: 'GUS.PALMER@EXAMPLE.COM',
    email: 'gus.palmer@example.com',
    service: 'Skylight install',
    status: 'ready',
  },
  {
    rawName: 'Hazel  Quinn',
    name: 'Hazel Quinn',
    rawPhone: '(555) 010-0147',
    phone: '+15550100147',
    rawEmail: 'harper.quinn@example.com',
    email: 'harper.quinn@example.com',
    service: 'Inspection',
    status: 'ready',
  },
  {
    rawName: 'Luca  Ortega',
    name: 'Luca Ortega',
    rawPhone: '5550100148',
    phone: '+15550100148',
    rawEmail: 'luis.ortega@example.com',
    email: 'luis.ortega@example.com',
    service: 'Storm damage',
    status: 'ready',
  },
  {
    rawName: 'Dana Whitfield',
    name: 'Dana Whitfield',
    rawPhone: '(555) 010-0101',
    phone: '+15550100101',
    rawEmail: 'dana.whitfield@example.com',
    email: 'dana.whitfield@example.com',
    service: 'Inspection',
    status: 'duplicate',
    issue: 'Matches an existing customer by phone',
  },
  {
    rawName: 'Marcus Lee',
    name: 'Marcus Lee',
    rawPhone: '(555) 010-0102',
    phone: '+15550100102',
    rawEmail: 'marcus.lee@example.com',
    email: 'marcus.lee@example.com',
    service: 'Shingle repair',
    status: 'duplicate',
    issue: 'Matches an existing customer by email',
  },
  {
    rawName: 'Casey  Nolan',
    name: 'Casey Nolan',
    rawPhone: '',
    phone: '',
    rawEmail: 'casey.nolan@example.com',
    email: 'casey.nolan@example.com',
    service: 'Roof repair',
    status: 'attention',
    issue: 'Missing phone number',
  },
  {
    rawName: 'Riley Morgan',
    name: 'Riley Morgan',
    rawPhone: '(555) 010-0149',
    phone: '+15550100149',
    rawEmail: 'riley.morgan@example',
    email: 'riley.morgan@example',
    service: 'Gutter repair',
    status: 'attention',
    issue: 'Email is missing a domain ending',
  },
]

const headers = ['Full name', 'Phone', 'Email', 'Service', 'Notes']
const cleanRows = sampleRows.filter((row) => row.status === 'ready')
const attentionRows = sampleRows.filter((row) => row.status === 'attention')
const duplicateRows = sampleRows.filter((row) => row.status === 'duplicate')

const steps = ['Upload', 'Match columns', 'Review & import']

export function ImportWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [permission, setPermission] = useState(false)
  const [mapping, setMapping] = useState({
    name: 'Full name',
    phone: 'Phone',
    email: 'Email',
    service: 'Service',
  })
  const toast = useToast()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setStep(0)
    setFileName(null)
    setPermission(false)
    panelRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  function acceptFile(name: string) {
    setFileName(name)
    setDragging(false)
  }

  function runImport() {
    const rows: ImportReadyRow[] = cleanRows.map((row) => {
      const [first_name, ...rest] = row.name.split(' ')
      return {
        first_name,
        last_name: rest.join(' '),
        phone: row.phone,
        email: row.email,
      }
    })
    try {
      const count = importCustomers(rows)
      toast({
        title: `${count} customers imported`,
        description: 'SMS and email consent records were created from the import.',
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Try again.',
        tone: 'error',
      })
    }
  }

  return (
    <div className="fixed inset-0 z-[75] grid place-items-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close import"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
        tabIndex={-1}
        className="relative flex max-h-[92dvh] w-full max-w-3xl animate-pop-in flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl outline-none"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 id="import-title" className="text-[17px] font-semibold text-fg">
              Import customers
            </h2>
            <p className="mt-0.5 text-[12.5px] text-muted">
              Upload a CSV or Excel file, match columns, then clean up before importing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-fg"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex items-center gap-1 border-b border-line px-5 py-2.5" aria-label="Import steps">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center gap-1">
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full text-[10px] font-semibold',
                  index < step && 'bg-accent/15 text-accent-soft',
                  index === step && 'bg-accent text-[#04170f]',
                  index > step && 'bg-white/[0.06] text-faint',
                )}
              >
                {index < step ? <Check className="size-3" aria-hidden /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-[11.5px] font-medium',
                  index === step ? 'text-fg' : 'text-faint',
                )}
              >
                {label}
              </span>
              {index < steps.length - 1 ? <span className="mx-1 h-px w-4 bg-line-strong" /> : null}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 0 ? (
            <div>
              <label
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  const file = event.dataTransfer.files[0]
                  acceptFile(file?.name ?? 'customers.csv')
                }}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center transition-colors',
                  dragging
                    ? 'border-accent/70 bg-accent/5'
                    : 'border-line-strong bg-ink/30 hover:border-accent/40',
                )}
              >
                <span className="grid size-12 place-items-center rounded-full border border-line bg-surface-raised text-accent-soft">
                  <UploadCloud className="size-5" aria-hidden />
                </span>
                <span className="mt-3 text-[14px] font-semibold text-fg">
                  Drop your file here, or click to browse
                </span>
                <span className="mt-1 text-[12px] text-muted">CSV or Excel · up to 5 MB · fake data only</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) acceptFile(file.name)
                  }}
                />
              </label>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => acceptFile('sample-customers.csv')}
                  className="text-[12px] font-medium text-accent-soft hover:text-accent"
                >
                  Use sample file
                </button>
                {fileName ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink/40 px-2.5 py-1 text-[11.5px] text-muted">
                    <FileSpreadsheet className="size-3.5 text-accent-soft" aria-hidden />
                    {fileName}
                    <button
                      type="button"
                      onClick={() => setFileName(null)}
                      aria-label="Remove file"
                      className="ml-1 rounded-full text-faint hover:text-fg"
                    >
                      <X className="size-3" aria-hidden />
                    </button>
                  </span>
                ) : (
                  <span className="text-[11.5px] text-faint">No file selected</span>
                )}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <p className="text-[12.5px] text-muted">
                We found {headers.length} columns in <span className="text-fg">{fileName}</span>. Match
                the fields you want to keep.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ['name', 'Name'],
                    ['phone', 'Phone'],
                    ['email', 'Email'],
                    ['service', 'Service'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label htmlFor={`map-${key}`} className="mb-1.5 block text-[12px] font-medium text-muted">
                      {label}
                    </label>
                    <select
                      id={`map-${key}`}
                      value={mapping[key]}
                      onChange={(event) =>
                        setMapping((current) => ({ ...current, [key]: event.target.value }))
                      }
                      className="h-10 w-full rounded-xl border border-line-strong bg-ink/50 px-3 text-[13px] text-fg"
                    >
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-line">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-ink/50 text-[10.5px] uppercase tracking-wide text-faint">
                    <tr>
                      {headers.slice(0, 4).map((header) => (
                        <th key={header} className="px-3 py-2 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {sampleRows.slice(0, 3).map((row) => (
                      <tr key={row.name}>
                        <td className="px-3 py-2 text-muted">{row.rawName}</td>
                        <td className="px-3 py-2 text-muted">{row.rawPhone || '—'}</td>
                        <td className="px-3 py-2 text-muted">{row.rawEmail || '—'}</td>
                        <td className="px-3 py-2 text-muted">{row.service}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Summary label="Rows found" value={String(sampleRows.length)} />
                <Summary label="Ready" value={String(cleanRows.length)} tone="accent" />
                <Summary label="Duplicates removed" value={String(duplicateRows.length)} />
                <Summary label="Need attention" value={String(attentionRows.length)} tone="warn" />
              </div>

              <div>
                <p className="mb-2 text-[12px] font-medium text-muted">Cleaned up automatically</p>
                <div className="overflow-hidden rounded-xl border border-line">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-ink/50 text-[10.5px] uppercase tracking-wide text-faint">
                      <tr>
                        <th className="px-3 py-2 font-medium">Before</th>
                        <th className="px-3 py-2 font-medium">After</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {sampleRows.slice(0, 4).map((row) => (
                        <tr key={row.name}>
                          <td className="px-3 py-2 text-faint">
                            {row.rawName} · {row.rawPhone || 'no phone'}
                          </td>
                          <td className="px-3 py-2 text-fg">
                            {row.name} · {row.phone || 'no phone'}
                          </td>
                          <td className="px-3 py-2">
                            <Badge tone="accent" dot>
                              Cleaned
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-1.5 text-[11px] text-faint">
                  Names trimmed, phone numbers converted to E.164, emails lowercased.
                </p>
              </div>

              {attentionRows.length > 0 ? (
                <div>
                  <p className="mb-2 text-[12px] font-medium text-warn">
                    {attentionRows.length} rows need attention (skipped)
                  </p>
                  <div className="divide-y divide-line/60 rounded-xl border border-warn/20 bg-warn/[0.04]">
                    {attentionRows.map((row) => (
                      <div key={row.name} className="flex items-start justify-between gap-3 px-3 py-2">
                        <div>
                          <p className="text-[12.5px] text-fg">{row.name}</p>
                          <p className="text-[11px] text-faint">{row.issue}</p>
                        </div>
                        <Badge tone="warn">Needs attention</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-accent/25 bg-accent/[0.06] p-3">
                <input
                  type="checkbox"
                  checked={permission}
                  onChange={(event) => setPermission(event.target.checked)}
                  className="mt-0.5 size-4 accent-[#10b981]"
                />
                <span className="text-[12.5px] leading-5 text-fg">
                  I confirm I have permission to contact these customers.
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-faint">
                    <ShieldCheck className="size-3" aria-hidden />
                    Imported customers get review-request consent only, never promotional consent.
                  </span>
                </span>
              </label>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-line bg-ink/40 px-5 py-3.5">
          <div>
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setStep((current) => current - 1)}>
                <ArrowLeft className="size-4" aria-hidden />
                Back
              </Button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            {step < 2 ? (
              <Button
                size="sm"
                disabled={step === 0 && !fileName}
                onClick={() => setStep((current) => current + 1)}
              >
                Continue
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            ) : (
              <Button size="sm" disabled={!permission} onClick={runImport}>
                Import {cleanRows.length} customers
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Summary({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'accent' | 'warn'
}) {
  return (
    <div className="rounded-xl border border-line bg-ink/30 px-3 py-2.5">
      <p
        className={cn(
          'text-[20px] font-semibold leading-none',
          tone === 'accent' && 'text-accent-soft',
          tone === 'warn' && 'text-warn',
          tone === 'default' && 'text-fg',
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[10.5px] text-faint">{label}</p>
    </div>
  )
}
