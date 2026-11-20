'use client'

import { useAppStore, type LocationFilter } from '@/store/app-store'

/**
 * Organization/location switching.
 *
 * In the mock these only update the in-memory store. When Supabase is wired
 * in, the active org will also live in a cookie and be validated against the
 * `memberships` table on the server.
 */

// TODO: replace with Supabase query (memberships joined to organizations)
export function switchOrganization(orgId: string) {
  useAppStore.getState().switchOrganization(orgId)
}

// TODO: replace with Supabase query (locations for the active org)
export function switchLocation(locationId: LocationFilter) {
  useAppStore.getState().switchLocation(locationId)
}

// TODO: replace with a re-fetch of the demo dataset
export function resetDemoData() {
  useAppStore.getState().resetDemo()
}

export function toggleSidebar() {
  useAppStore.getState().toggleSidebar()
}
