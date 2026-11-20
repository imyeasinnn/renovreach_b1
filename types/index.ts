/**
 * Shared domain types.
 *
 * Field names intentionally mirror the planned Postgres tables
 * (organizations, memberships, locations, customers, jobs, consents,
 * review_requests, messages, reviews, campaigns, activity_logs) so the
 * mock service layer can later be swapped for Supabase queries with
 * little more than a type import.
 */

export type OrgRole = 'owner' | 'admin' | 'manager' | 'staff'
export type Channel = 'sms' | 'email'
export type ConsentPurpose = 'review_request' | 'promotional' | 'transactional'
export type ConsentStatus = 'granted' | 'withdrawn'
export type JobStatus = 'scheduled' | 'in_progress' | 'completed'
export type ReviewRequestStatus =
  | 'scheduled'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'skipped_no_consent'
  | 'skipped_opted_out'
export type MessageDirection = 'outbound' | 'inbound'
export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'received'
export type ReviewStatus = 'new' | 'replied'
export type CampaignStatus = 'draft' | 'scheduled' | 'sent'

export interface Organization {
  id: string
  name: string
  slug: string
  status: 'active' | 'suspended'
  timezone: string
  created_at: string
}

export interface Location {
  id: string
  organization_id: string
  name: string
  address_line1: string
  city: string
  state: string
  postal_code: string
  phone_e164: string
  timezone: string
  review_link: string | null
  is_active: boolean
  deleted_at: string | null
  created_at: string
}

export interface Membership {
  id: string
  organization_id: string
  user_id: string
  full_name: string
  email: string
  role: OrgRole
  created_at: string
}

export interface Customer {
  id: string
  organization_id: string
  location_id: string | null
  first_name: string
  last_name: string
  phone_e164: string | null
  email: string | null
  source: 'manual' | 'import' | 'webhook'
  external_id: string | null
  tags: string[]
  deleted_at: string | null
  created_at: string
}

export interface Job {
  id: string
  organization_id: string
  location_id: string
  customer_id: string
  service_type: string
  status: JobStatus
  scheduled_for: string
  completed_at: string | null
  source: 'manual' | 'webhook'
  external_id: string | null
  created_at: string
}

export interface Consent {
  id: string
  organization_id: string
  customer_id: string
  channel: Channel
  purpose: ConsentPurpose
  status: ConsentStatus
  source: string
  wording_text: string
  wording_version: string
  captured_at: string
}

export interface ReviewRequest {
  id: string
  organization_id: string
  location_id: string
  job_id: string
  customer_id: string
  channel: Channel
  status: ReviewRequestStatus
  scheduled_for: string
  sent_at: string | null
  delivered_at: string | null
  attempts: number
  last_error: string | null
  created_at: string
}

export interface Message {
  id: string
  organization_id: string
  customer_id: string
  review_request_id: string | null
  direction: MessageDirection
  channel: Channel
  to_address: string
  body: string
  status: MessageStatus
  provider: 'twilio' | 'resend' | null
  provider_message_id: string | null
  idempotency_key: string
  error_code: string | null
  error_message: string | null
  attempts: number
  sent_at: string | null
  delivered_at: string | null
  created_at: string
}

export interface Review {
  id: string
  organization_id: string
  location_id: string
  customer_id: string
  reviewer_name: string
  rating: number
  comment: string
  platform: 'google'
  status: ReviewStatus
  reviewed_at: string
  reply_text: string | null
  created_at: string
}

export interface Campaign {
  id: string
  organization_id: string
  name: string
  channel: Channel
  status: CampaignStatus
  audience_size: number
  created_at: string
}

export interface ActivityLog {
  id: string
  organization_id: string
  location_id: string | null
  actor_user_id: string | null
  actor_name: string | null
  action:
    | 'job.completed'
    | 'request.sent'
    | 'request.failed'
    | 'review.received'
    | 'customer.opted_out'
    | 'customer.created'
    | 'customer.updated'
    | 'customer.archived'
    | 'customers.imported'
    | 'location.created'
  entity_type: 'job' | 'review_request' | 'review' | 'customer' | 'location'
  entity_id: string
  metadata: Record<string, string | number>
  created_at: string
}

export interface UsagePeriod {
  id: string
  organization_id: string
  period_start: string
  period_end: string
  credits_included: number
  credits_used: number
  renewal_date: string
}

/** The signed-in demo user. The mockup is owner-only by design. */
export interface DemoSession {
  user_id: string
  full_name: string
  email: string
}
