'use client'

import { useMemo } from 'react'
import { useAppStore, type LocationFilter } from '@/store/app-store'
import { lastDays, startOfMonth } from '@/lib/format'
import type {
  ActivityLog,
  Consent,
  Customer,
  Job,
  Location,
  Organization,
  Review,
  ReviewRequest,
  UsagePeriod,
} from '@/types'

export interface DashboardSnapshot {
  organization: Organization | undefined
  locationLabel: string
  kpis: {
    jobsCompleted: number
    requestsSent: number
    requestsDelivered: number
    reviewsReceived: number
    newReviews: number
    averageRating: number | null
    creditsRemaining: number
    creditsIncluded: number
  }
  reviewSeries: { label: string; reviews: number }[]
  requestSeries: { label: string; sent: number; delivered: number }[]
  activity: ActivityLog[]
  attention: {
    failedRequests: number
    missingPhone: number
    optedOut: number
  }
}

interface SnapshotInput {
  organizations: Organization[]
  locations: Location[]
  customers: Customer[]
  jobs: Job[]
  reviewRequests: ReviewRequest[]
  reviews: Review[]
  consents: Consent[]
  activityLogs: ActivityLog[]
  usagePeriods: UsagePeriod[]
}

const dayKey = (iso: string) => iso.slice(0, 10)

function inScope(
  row: { organization_id: string; location_id?: string | null },
  orgId: string,
  locationId: LocationFilter,
) {
  if (row.organization_id !== orgId) return false
  if (locationId === 'all') return true
  return row.location_id === locationId
}

/**
 * Pure calculation so it can be unit tested and, later, replaced by a
 * Postgres view or RPC without touching the dashboard UI.
 */
export function buildDashboardSnapshot(
  data: SnapshotInput,
  orgId: string,
  locationId: LocationFilter,
): DashboardSnapshot {
  const organization = data.organizations.find((org) => org.id === orgId)
  const location = locationId === 'all' ? null : data.locations.find((loc) => loc.id === locationId)

  const monthStart = startOfMonth()
  const inMonth = (iso: string | null) => Boolean(iso && new Date(iso).getTime() >= monthStart)

  const orgJobs = data.jobs.filter((job) => inScope(job, orgId, locationId))
  const orgRequests = data.reviewRequests.filter((request) => inScope(request, orgId, locationId))
  const orgReviews = data.reviews.filter((review) => inScope(review, orgId, locationId))
  const orgCustomers = data.customers.filter(
    (customer) => inScope(customer, orgId, locationId) && !customer.deleted_at,
  )

  const completedJobs = orgJobs.filter((job) => job.status === 'completed' && inMonth(job.completed_at))
  const sentRequests = orgRequests.filter((request) => inMonth(request.sent_at))
  const deliveredRequests = orgRequests.filter((request) => inMonth(request.delivered_at))
  const monthReviews = orgReviews.filter((review) => inMonth(review.reviewed_at))
  const ratingPool = monthReviews.length > 0 ? monthReviews : orgReviews

  const averageRating =
    ratingPool.length > 0
      ? Math.round((ratingPool.reduce((sum, review) => sum + review.rating, 0) / ratingPool.length) * 10) / 10
      : null

  const usage = data.usagePeriods.find((period) => period.organization_id === orgId)
  const creditsIncluded = usage?.credits_included ?? 500
  const creditsUsed = usage?.credits_used ?? 0
  const creditsRemaining = Math.max(0, creditsIncluded - creditsUsed)

  const days = lastDays(30)
  const reviewSeries = days.map((day) => ({
    label: day.label,
    reviews: orgReviews.filter((review) => dayKey(review.reviewed_at) === day.key).length,
  }))
  const requestSeries = days.map((day) => ({
    label: day.label,
    sent: orgRequests.filter((request) => request.sent_at && dayKey(request.sent_at) === day.key).length,
    delivered: orgRequests.filter(
      (request) => request.delivered_at && dayKey(request.delivered_at) === day.key,
    ).length,
  }))

  const activity = [...data.activityLogs]
    .filter((entry) => inScope(entry, orgId, locationId))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const failedRequests = orgRequests.filter((request) => request.status === 'failed').length
  const missingPhone = orgCustomers.filter((customer) => !customer.phone_e164).length

  const optedOutCustomerIds = new Set(
    data.consents
      .filter(
        (item) =>
          item.organization_id === orgId &&
          item.status === 'withdrawn' &&
          orgCustomers.some((customer) => customer.id === item.customer_id),
      )
      .map((item) => item.customer_id),
  )

  return {
    organization,
    locationLabel: location?.name ?? 'All locations',
    kpis: {
      jobsCompleted: completedJobs.length,
      requestsSent: sentRequests.length,
      requestsDelivered: deliveredRequests.length,
      reviewsReceived: monthReviews.length,
      newReviews: orgReviews.filter((review) => review.status === 'new').length,
      averageRating,
      creditsRemaining,
      creditsIncluded,
    },
    reviewSeries,
    requestSeries,
    activity,
    attention: {
      failedRequests,
      missingPhone,
      optedOut: optedOutCustomerIds.size,
    },
  }
}

/** Dashboard data for the active organization and location. */
export function useDashboardSnapshot(): DashboardSnapshot {
  const organizations = useAppStore((state) => state.organizations)
  const locations = useAppStore((state) => state.locations)
  const customers = useAppStore((state) => state.customers)
  const jobs = useAppStore((state) => state.jobs)
  const reviewRequests = useAppStore((state) => state.reviewRequests)
  const reviews = useAppStore((state) => state.reviews)
  const consents = useAppStore((state) => state.consents)
  const activityLogs = useAppStore((state) => state.activityLogs)
  const usagePeriods = useAppStore((state) => state.usagePeriods)
  const orgId = useAppStore((state) => state.activeOrgId)
  const locationId = useAppStore((state) => state.activeLocationId)

  return useMemo(
    () =>
      buildDashboardSnapshot(
        { organizations, locations, customers, jobs, reviewRequests, reviews, consents, activityLogs, usagePeriods },
        orgId,
        locationId,
      ),
    [
      organizations,
      locations,
      customers,
      jobs,
      reviewRequests,
      reviews,
      consents,
      activityLogs,
      usagePeriods,
      orgId,
      locationId,
    ],
  )
}
