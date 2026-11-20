import type { Channel, Consent, ConsentPurpose } from '@/types'

export type ConsentDisplay = 'granted' | 'not_granted' | 'opted_out'

/** A consent history is append-only: the newest row wins. */
export function latestConsent(
  consents: Consent[],
  customerId: string,
  channel: Channel,
  purpose: ConsentPurpose = 'review_request',
): Consent | undefined {
  return consents
    .filter(
      (item) =>
        item.customer_id === customerId &&
        item.channel === channel &&
        item.purpose === purpose,
    )
    .sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime())[0]
}

export function consentDisplay(
  consents: Consent[],
  customerId: string,
  channel: Channel,
  purpose: ConsentPurpose = 'review_request',
): ConsentDisplay {
  const latest = latestConsent(consents, customerId, channel, purpose)
  if (!latest) return 'not_granted'
  return latest.status === 'granted' ? 'granted' : 'opted_out'
}

/** Opted-out customers are never selectable for sending. */
export function canContact(customerId: string, consents: Consent[]): boolean {
  const sms = consentDisplay(consents, customerId, 'sms')
  const email = consentDisplay(consents, customerId, 'email')
  return sms === 'granted' || email === 'granted'
}
