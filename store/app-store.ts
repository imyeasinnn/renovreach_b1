'use client'

import { create } from 'zustand'
import { seedData, demoUser } from '@/mock-data'
import type {
  ActivityLog,
  Campaign,
  Consent,
  Customer,
  Job,
  Location,
  Membership,
  Message,
  Organization,
  Review,
  ReviewRequest,
  UsagePeriod,
} from '@/types'

export type LocationFilter = 'all' | string

export interface AppState {
  organizations: Organization[]
  locations: Location[]
  memberships: Membership[]
  customers: Customer[]
  jobs: Job[]
  consents: Consent[]
  reviewRequests: ReviewRequest[]
  messages: Message[]
  reviews: Review[]
  campaigns: Campaign[]
  activityLogs: ActivityLog[]
  usagePeriods: UsagePeriod[]

  activeOrgId: string
  activeLocationId: LocationFilter
  sidebarCollapsed: boolean

  switchOrganization: (orgId: string) => void
  switchLocation: (locationId: LocationFilter) => void
  toggleSidebar: () => void
  resetDemo: () => void

  createCustomer: (customer: Customer, consents: Consent[], activity: ActivityLog) => void
  updateCustomer: (customerId: string, patch: Partial<Customer>, activity?: ActivityLog) => void
  archiveCustomer: (customerId: string, activity: ActivityLog) => void
  addCustomers: (customers: Customer[], consents: Consent[], activity: ActivityLog) => void
}

function cloneSeed() {
  return structuredClone(seedData)
}

export const useAppStore = create<AppState>((set) => ({
  ...cloneSeed(),

  activeOrgId: 'org_roof',
  activeLocationId: 'all',
  sidebarCollapsed: false,

  switchOrganization: (orgId) =>
    set((state) =>
      state.organizations.some((org) => org.id === orgId)
        ? { activeOrgId: orgId, activeLocationId: 'all' }
        : state,
    ),

  switchLocation: (locationId) => set({ activeLocationId: locationId }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  resetDemo: () =>
    set({
      ...cloneSeed(),
      activeOrgId: 'org_roof',
      activeLocationId: 'all',
      sidebarCollapsed: false,
    }),

  createCustomer: (customer, consents, activity) =>
    set((state) => ({
      customers: [...state.customers, customer],
      consents: [...state.consents, ...consents],
      activityLogs: [activity, ...state.activityLogs],
    })),

  updateCustomer: (customerId, patch, activity) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId ? { ...customer, ...patch } : customer,
      ),
      activityLogs: activity ? [activity, ...state.activityLogs] : state.activityLogs,
    })),

  archiveCustomer: (customerId, activity) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? { ...customer, deleted_at: new Date().toISOString() }
          : customer,
      ),
      activityLogs: [activity, ...state.activityLogs],
    })),

  addCustomers: (customers, consents, activity) =>
    set((state) => ({
      customers: [...state.customers, ...customers],
      consents: [...state.consents, ...consents],
      activityLogs: [activity, ...state.activityLogs],
    })),
}))

export { demoUser }
