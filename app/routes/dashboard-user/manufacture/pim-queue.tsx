import type { Route } from '@/routes/+types/root'
import { PimQueuePage } from '@/dashboard-user/manufacture/pim-queue'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'PIM Queue' },
    { name: 'description', content: 'PIM Queue - Production Instruction Sequence' },
  ]
}

export default function PimQueueRoute() {
  return <PimQueuePage />
}
