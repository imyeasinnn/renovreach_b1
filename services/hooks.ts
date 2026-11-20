'use client'

import { useMemo } from 'react'
import { useAppStore } from '@/store/app-store'

/** Read hooks used by the shell. All data access goes through /services. */

export function useOrganizations() {
  return useAppStore((state) => state.organizations)
}

export function useActiveOrganizationId() {
  return useAppStore((state) => state.activeOrgId)
}

export function useActiveOrganization() {
  return useAppStore((state) =>
    state.organizations.find((org) => org.id === state.activeOrgId),
  )
}

export function useLocations() {
  const locations = useAppStore((state) => state.locations)
  const orgId = useAppStore((state) => state.activeOrgId)
  return useMemo(
    () => locations.filter((location) => location.organization_id === orgId),
    [locations, orgId],
  )
}

export function useActiveLocationFilter() {
  return useAppStore((state) => state.activeLocationId)
}

export function useCurrentMembership() {
  return useAppStore((state) =>
    state.memberships.find(
      (membership) =>
        membership.organization_id === state.activeOrgId &&
        membership.user_id === 'user_demo',
    ),
  )
}

export function useRecentActivity(limit = 5) {
  const activityLogs = useAppStore((state) => state.activityLogs)
  const orgId = useAppStore((state) => state.activeOrgId)
  return useMemo(
    () =>
      [...activityLogs]
        .filter((entry) => entry.organization_id === orgId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit),
    [activityLogs, orgId, limit],
  )
}

export function useSidebarCollapsed() {
  return useAppStore((state) => state.sidebarCollapsed)
}

export function useUsage() {
  return useAppStore((state) =>
    state.usagePeriods.find((period) => period.organization_id === state.activeOrgId),
  )
}
