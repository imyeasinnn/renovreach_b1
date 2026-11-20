import { Badge, type BadgeTone } from '@/components/ui/badge'
import type { ConsentDisplay } from '@/lib/consent'

const labels: Record<ConsentDisplay, string> = {
  granted: 'Granted',
  not_granted: 'Not granted',
  opted_out: 'Opted out',
}

const tones: Record<ConsentDisplay, BadgeTone> = {
  granted: 'accent',
  not_granted: 'muted',
  opted_out: 'danger',
}

/** Compact channel + consent badge for mobile cards. */
export function ChannelConsent({ label, state }: { label: string; state: ConsentDisplay }) {
  return (
    <Badge tone={tones[state]} dot>
      {label} · {labels[state]}
    </Badge>
  )
}
