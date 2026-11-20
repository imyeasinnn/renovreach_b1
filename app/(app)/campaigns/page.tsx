import { ComingSoon } from '@/components/shell/coming-soon'
import { PageHeader } from '@/components/ui/page-header'

export default function CampaignsPage() {
  return (
    <>
      <PageHeader title="Campaigns" description="Promotional messages for customers who opted in." />
      <ComingSoon title="Campaigns" />
    </>
  )
}
