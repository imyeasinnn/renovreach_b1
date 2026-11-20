import { ComingSoon } from '@/components/shell/coming-soon'
import { PageHeader } from '@/components/ui/page-header'

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Organization, locations, members, automation, and compliance."
      />
      <ComingSoon title="Settings" />
    </>
  )
}
