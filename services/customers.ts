'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store/app-store'
import { consentDisplay, type ConsentDisplay } from '@/lib/consent'
import { normalizePhone } from '@/lib/phone'
import { isValidEmail } from '@/lib/phone'
import { newId } from '@/lib/ids'
import { emailReviewWording, smsReviewWording } from '@/lib/compliance'
import type { Consent, Customer, Job, Message } from '@/types'

export interface CustomerRow extends Customer {
  location_name: string
  last_job_at: string | null
  job_count: number
  sms_consent: ConsentDisplay
  email_consent: ConsentDisplay
}

export interface CustomerDetail {
  customer: Customer
  location_name: string
  jobs: Job[]
  messages: Message[]
  consents: Consent[]
  sms_consent: ConsentDisplay
  email_consent: ConsentDisplay
}

export interface CustomerInput {
  first_name: string
  last_name: string
  phone: string
  email: string
  location_id: string
  tags: string[]
  sms_consent: boolean
  email_consent: boolean
}

/** Customers for the active organization + location, without archived rows. */
export function useCustomerRows(): CustomerRow[] {
  const customers = useAppStore((state) => state.customers)
  const jobs = useAppStore((state) => state.jobs)
  const consents = useAppStore((state) => state.consents)
  const locations = useAppStore((state) => state.locations)
  const orgId = useAppStore((state) => state.activeOrgId)
  const locationFilter = useAppStore((state) => state.activeLocationId)

  return useMemo(() => {
    return customers
      .filter(
        (customer) =>
          customer.organization_id === orgId &&
          !customer.deleted_at &&
          (locationFilter === 'all' || customer.location_id === locationFilter),
      )
      .map((customer) => {
        const customerJobs = jobs.filter((job) => job.customer_id === customer.id)
        const lastJob = customerJobs
          .map((job) => job.completed_at ?? job.scheduled_for)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]

        return {
          ...customer,
          location_name:
            locations.find((location) => location.id === customer.location_id)?.name ??
            'Organization-wide',
          last_job_at: lastJob ?? null,
          job_count: customerJobs.length,
          sms_consent: consentDisplay(consents, customer.id, 'sms'),
          email_consent: consentDisplay(consents, customer.id, 'email'),
        }
      })
  }, [customers, jobs, consents, locations, orgId, locationFilter])
}

/** Single customer with jobs, messages, and the full consent history. */
export function useCustomerDetail(customerId: string): CustomerDetail | undefined {
  const customers = useAppStore((state) => state.customers)
  const jobs = useAppStore((state) => state.jobs)
  const messages = useAppStore((state) => state.messages)
  const consents = useAppStore((state) => state.consents)
  const locations = useAppStore((state) => state.locations)

  return useMemo(() => {
    const customer = customers.find(
      (row) => row.id === customerId && !row.deleted_at,
    )
    if (!customer) return undefined

    return {
      customer,
      location_name:
        locations.find((location) => location.id === customer.location_id)?.name ??
        'Organization-wide',
      jobs: jobs
        .filter((job) => job.customer_id === customer.id)
        .sort(
          (a, b) =>
            new Date(b.completed_at ?? b.scheduled_for).getTime() -
            new Date(a.completed_at ?? a.scheduled_for).getTime(),
        ),
      messages: messages
        .filter((message) => message.customer_id === customer.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      consents: consents
        .filter((consent) => consent.customer_id === customer.id)
        .sort(
          (a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime(),
        ),
      sms_consent: consentDisplay(consents, customer.id, 'sms'),
      email_consent: consentDisplay(consents, customer.id, 'email'),
    }
  }, [customers, jobs, messages, consents, locations, customerId])
}

function currentOrgName(orgId: string): string {
  return (
    useAppStore.getState().organizations.find((org) => org.id === orgId)?.name ??
    'your business'
  )
}

function buildConsents(customerId: string, orgId: string, input: CustomerInput): Consent[] {
  const now = new Date().toISOString()
  const business = currentOrgName(orgId)
  const rows: Consent[] = []

  if (input.sms_consent && normalizePhone(input.phone)) {
    rows.push({
      id: newId('con'),
      organization_id: orgId,
      customer_id: customerId,
      channel: 'sms',
      purpose: 'review_request',
      status: 'granted',
      source: 'Added by owner',
      wording_text: smsReviewWording(business),
      wording_version: '2026-01-v1',
      captured_at: now,
    })
  }
  if (input.email_consent && input.email.trim()) {
    rows.push({
      id: newId('con'),
      organization_id: orgId,
      customer_id: customerId,
      channel: 'email',
      purpose: 'review_request',
      status: 'granted',
      source: 'Added by owner',
      wording_text: emailReviewWording(business),
      wording_version: '2026-01-v1',
      captured_at: now,
    })
  }
  return rows
}

function customerName(customer: Pick<Customer, 'first_name' | 'last_name'>) {
  return `${customer.first_name} ${customer.last_name}`.trim()
}

/** TODO: replace with Supabase insert into customers + consents. */
export function createCustomer(input: CustomerInput): Customer {
  const state = useAppStore.getState()
  const orgId = state.activeOrgId
  const phone = normalizePhone(input.phone)
  const email = input.email.trim().toLowerCase()

  if (!input.first_name.trim() || !input.last_name.trim()) {
    throw new Error('First and last name are required.')
  }
  if (!phone && !email) throw new Error('Add a phone number or an email address.')
  if (input.phone.trim() && !phone) throw new Error('Enter a valid phone number.')
  if (email && !isValidEmail(email)) throw new Error('Enter a valid email address.')
  if (!input.location_id) throw new Error('Choose a location.')

  const customer: Customer = {
    id: newId('cus'),
    organization_id: orgId,
    location_id: input.location_id,
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    phone_e164: phone,
    email: email || null,
    source: 'manual',
    external_id: null,
    tags: input.tags,
    deleted_at: null,
    created_at: new Date().toISOString(),
  }

  const activity = {
    id: newId('act'),
    organization_id: orgId,
    location_id: input.location_id,
    actor_user_id: 'user_demo',
    actor_name: 'Jordan Avery',
    action: 'customer.created' as const,
    entity_type: 'customer' as const,
    entity_id: customer.id,
    metadata: { customer: customerName(customer) },
    created_at: new Date().toISOString(),
  }

  useAppStore
    .getState()
    .createCustomer(customer, buildConsents(customer.id, orgId, input), activity)

  return customer
}

/** TODO: replace with Supabase update. Consent changes append new rows instead. */
export function updateCustomer(customerId: string, input: CustomerInput) {
  const state = useAppStore.getState()
  const existing = state.customers.find((customer) => customer.id === customerId)
  if (!existing) throw new Error('Customer not found.')

  const phone = normalizePhone(input.phone)
  const email = input.email.trim().toLowerCase()

  if (!input.first_name.trim() || !input.last_name.trim()) {
    throw new Error('First and last name are required.')
  }
  if (!phone && !email) throw new Error('Add a phone number or an email address.')
  if (input.phone.trim() && !phone) throw new Error('Enter a valid phone number.')
  if (email && !isValidEmail(email)) throw new Error('Enter a valid email address.')
  if (!input.location_id) throw new Error('Choose a location.')

  const name = `${input.first_name.trim()} ${input.last_name.trim()}`
  state.updateCustomer(
    customerId,
    {
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      phone_e164: phone,
      email: email || null,
      location_id: input.location_id,
      tags: input.tags,
    },
    {
      id: newId('act'),
      organization_id: existing.organization_id,
      location_id: input.location_id,
      actor_user_id: 'user_demo',
      actor_name: 'Jordan Avery',
      action: 'customer.updated',
      entity_type: 'customer',
      entity_id: customerId,
      metadata: { customer: name },
      created_at: new Date().toISOString(),
    },
  )
}

/** Soft delete: history and consent rows are kept. */
export function archiveCustomer(customerId: string) {
  const state = useAppStore.getState()
  const existing = state.customers.find((customer) => customer.id === customerId)
  if (!existing) return

  state.archiveCustomer(customerId, {
    id: newId('act'),
    organization_id: existing.organization_id,
    location_id: existing.location_id,
    actor_user_id: 'user_demo',
    actor_name: 'Jordan Avery',
    action: 'customer.archived',
    entity_type: 'customer',
    entity_id: customerId,
    metadata: { customer: customerName(existing) },
    created_at: new Date().toISOString(),
  })
}

export interface ImportReadyRow {
  first_name: string
  last_name: string
  phone: string
  email: string
}

/** TODO: replace with a batched Supabase insert after column mapping. */
export function importCustomers(rows: ImportReadyRow[]): number {
  const state = useAppStore.getState()
  const orgId = state.activeOrgId
  const business = currentOrgName(orgId)
  const fallbackLocation = state.locations.find((location) => location.organization_id === orgId)
  const locationId =
    state.activeLocationId !== 'all' ? state.activeLocationId : fallbackLocation?.id

  if (!locationId) throw new Error('Add a location before importing customers.')

  const now = new Date().toISOString()
  const customers: Customer[] = []
  const consents: Consent[] = []

  for (const row of rows) {
    const phone = normalizePhone(row.phone)
    const email = row.email.trim().toLowerCase()
    if (!phone && !email) continue

    const customer: Customer = {
      id: newId('cus'),
      organization_id: orgId,
      location_id: locationId,
      first_name: row.first_name.trim(),
      last_name: row.last_name.trim(),
      phone_e164: phone,
      email: email || null,
      source: 'import',
      external_id: null,
      tags: ['Imported'],
      deleted_at: null,
      created_at: now,
    }
    customers.push(customer)

    if (phone) {
      consents.push({
        id: newId('con'),
        organization_id: orgId,
        customer_id: customer.id,
        channel: 'sms',
        purpose: 'review_request',
        status: 'granted',
        source: 'CSV import — permission confirmed',
        wording_text: smsReviewWording(business),
        wording_version: '2026-01-v1',
        captured_at: now,
      })
    }
    if (email) {
      consents.push({
        id: newId('con'),
        organization_id: orgId,
        customer_id: customer.id,
        channel: 'email',
        purpose: 'review_request',
        status: 'granted',
        source: 'CSV import — permission confirmed',
        wording_text: emailReviewWording(business),
        wording_version: '2026-01-v1',
        captured_at: now,
      })
    }
  }

  if (customers.length === 0) throw new Error('No ready rows to import.')

  state.addCustomers(customers, consents, {
    id: newId('act'),
    organization_id: orgId,
    location_id: locationId,
    actor_user_id: 'user_demo',
    actor_name: 'Jordan Avery',
    action: 'customers.imported',
    entity_type: 'customer',
    entity_id: 'batch',
    metadata: { count: customers.length },
    created_at: now,
  })

  return customers.length
}
