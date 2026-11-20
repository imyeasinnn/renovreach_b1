import { ComingSoon } from '@/components/shell/coming-soon'
import { PageHeader } from '@/components/ui/page-header'

export default function ActivityPage() {
  return (
    <>
      <PageHeader title="Activity" description="A full log of jobs, requests, messages, and reviews." />
      <ComingSoon title="Activity log" />
    </>
  )
}
