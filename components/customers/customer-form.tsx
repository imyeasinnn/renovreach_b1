'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SlideOver } from '@/components/ui/slide-over'
import { useToast } from '@/components/ui/toast'
import { useLocations } from '@/services/hooks'
import { createCustomer, updateCustomer } from '@/services/customers'
import { formatPhoneInput } from '@/lib/phone'
import { cn } from '@/lib/cn'
import type { Customer } from '@/types'

interface FormState {
  first_name: string
  last_name: string
  phone: string
  email: string
  location_id: string
  tags: string
  sms_consent: boolean
  email_consent: boolean
}

const emptyForm: FormState = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  location_id: '',
  tags: '',
  sms_consent: true,
  email_consent: true,
}

const inputClass =
  'h-10 w-full rounded-xl border border-line-strong bg-ink/50 px-3 text-[13.5px] text-fg placeholder:text-faint transition-colors focus:border-accent/60 focus:outline-none'

export function CustomerForm({
  open,
  customer,
  onClose,
}: {
  open: boolean
  customer: Customer | null
  onClose: () => void
}) {
  const locations = useLocations()
  const toast = useToast()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setErrors({})
    setFormError(null)
    if (customer) {
      setForm({
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone_e164 ? formatPhoneInput(customer.phone_e164) : '',
        email: customer.email ?? '',
        location_id: customer.location_id ?? locations[0]?.id ?? '',
        tags: customer.tags.join(', '),
        sms_consent: false,
        email_consent: false,
      })
    } else {
      setForm({ ...emptyForm, location_id: locations[0]?.id ?? '' })
    }
    // Locations are stable for the active org during the panel's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)

    const nextErrors: Record<string, string> = {}
    if (!form.first_name.trim()) nextErrors.first_name = 'First name is required.'
    if (!form.last_name.trim()) nextErrors.last_name = 'Last name is required.'
    if (!form.phone.trim() && !form.email.trim()) {
      nextErrors.phone = 'Add a phone number or an email.'
    }
    if (!form.location_id) nextErrors.location_id = 'Choose a location.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const tags = form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    try {
      if (customer) {
        updateCustomer(customer.id, {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          email: form.email,
          location_id: form.location_id,
          tags,
          sms_consent: false,
          email_consent: false,
        })
        toast({ title: 'Customer updated', description: `${form.first_name} ${form.last_name} was saved.` })
      } else {
        createCustomer({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          email: form.email,
          location_id: form.location_id,
          tags,
          sms_consent: form.sms_consent,
          email_consent: form.email_consent,
        })
        toast({
          title: 'Customer added',
          description: `${form.first_name} ${form.last_name} is ready for jobs.`,
        })
      }
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong.')
    }
  }

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={customer ? 'Edit customer' : 'Add customer'}
      description={
        customer
          ? 'Update contact details. Consent history cannot be edited here.'
          : 'Add someone you serve. Consent is recorded separately for SMS and email.'
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form" size="sm">
            {customer ? 'Save changes' : 'Add customer'}
          </Button>
        </div>
      }
    >
      <form id="customer-form" onSubmit={submit} noValidate className="space-y-4">
        {formError ? (
          <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
            {formError}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" htmlFor="first_name" error={errors.first_name}>
            <input
              id="first_name"
              value={form.first_name}
              onChange={(event) => update('first_name', event.target.value)}
              className={inputClass}
              placeholder="Dana"
              autoComplete="given-name"
              aria-invalid={Boolean(errors.first_name)}
              aria-describedby={errors.first_name ? 'first_name-error' : undefined}
            />
          </Field>
          <Field label="Last name" htmlFor="last_name" error={errors.last_name}>
            <input
              id="last_name"
              value={form.last_name}
              onChange={(event) => update('last_name', event.target.value)}
              className={inputClass}
              placeholder="Whitfield"
              autoComplete="family-name"
              aria-invalid={Boolean(errors.last_name)}
              aria-describedby={errors.last_name ? 'last_name-error' : undefined}
            />
          </Field>
        </div>

        <Field label="Phone" htmlFor="phone" error={errors.phone} hint="US numbers only in this demo.">
          <input
            id="phone"
            value={form.phone}
            onChange={(event) => update('phone', formatPhoneInput(event.target.value))}
            className={inputClass}
            placeholder="(555) 010-0101"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            onBlur={() => update('email', form.email.trim().toLowerCase())}
            className={inputClass}
            placeholder="dana@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </Field>

        <Field label="Location" htmlFor="location_id" error={errors.location_id}>
          <select
            id="location_id"
            value={form.location_id}
            onChange={(event) => update('location_id', event.target.value)}
            className={cn(inputClass, 'appearance-none')}
            aria-invalid={Boolean(errors.location_id)}
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tags" htmlFor="tags" hint="Comma separated, for example Repeat, VIP.">
          <input
            id="tags"
            value={form.tags}
            onChange={(event) => update('tags', event.target.value)}
            className={inputClass}
            placeholder="Repeat, VIP"
          />
        </Field>

        {!customer ? (
          <fieldset className="rounded-xl border border-line bg-ink/30 p-3.5">
            <legend className="px-1 text-[12px] font-medium text-muted">Review request consent</legend>
            <p className="mb-2 text-[11.5px] leading-5 text-faint">
              Review requests and promotional messages use separate consent. Only check these if the
              customer agreed.
            </p>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg py-1.5 text-[12.5px] text-fg">
              <input
                type="checkbox"
                checked={form.sms_consent}
                onChange={(event) => update('sms_consent', event.target.checked)}
                className="mt-0.5 size-4 accent-[#10b981]"
              />
              <span>
                SMS consent
                <span className="block text-[11px] text-faint">Reply STOP to opt out is included in every text.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg py-1.5 text-[12.5px] text-fg">
              <input
                type="checkbox"
                checked={form.email_consent}
                onChange={(event) => update('email_consent', event.target.checked)}
                className="mt-0.5 size-4 accent-[#10b981]"
              />
              <span>
                Email consent
                <span className="block text-[11px] text-faint">An unsubscribe link is included in every email.</span>
              </span>
            </label>
          </fieldset>
        ) : (
          <p className="rounded-xl border border-line bg-ink/30 px-3 py-2.5 text-[11.5px] leading-5 text-faint">
            Consent changes are added as new entries from the customer detail page, so the history stays
            intact.
          </p>
        )}
      </form>
    </SlideOver>
  )
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-medium text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1 text-[11.5px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-faint">{hint}</p>
      ) : null}
    </div>
  )
}
