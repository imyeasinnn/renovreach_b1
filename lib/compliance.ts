/** Consent wording shown to customers. Kept in one place so the demo matches later templates. */
export function smsReviewWording(business: string): string {
  return `I agree to receive a one-time review request by text from ${business}. Reply STOP to opt out. Message and data rates may apply.`
}

export function emailReviewWording(business: string): string {
  return `I agree to receive a one-time review request by email from ${business}. I can unsubscribe at any time.`
}
