import { ComingSoon } from '@/components/shell/coming-soon'
import { PageHeader } from '@/components/ui/page-header'

export default function CreditsPage() {
  return (
    <>
      <PageHeader title="Credits & Usage" description="Plan, messaging credits, and usage history." />
      <ComingSoon title="Credits & Usage" />
    </>
  )
}
