import { ComingSoon } from '@/components/shell/coming-soon'
import { PageHeader } from '@/components/ui/page-header'

export default function JobsPage() {
  return (
    <>
      <PageHeader title="Jobs" description="Track scheduled work and trigger review requests on completion." />
      <ComingSoon title="Jobs" />
    </>
  )
}
