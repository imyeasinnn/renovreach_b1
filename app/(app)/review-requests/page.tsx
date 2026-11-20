import { ComingSoon } from '@/components/shell/coming-soon'
import { PageHeader } from '@/components/ui/page-header'

export default function ReviewRequestsPage() {
  return (
    <>
      <PageHeader
        title="Review Requests"
        description="Every automated review request, from scheduled to delivered."
      />
      <ComingSoon title="Review Requests" />
    </>
  )
}
