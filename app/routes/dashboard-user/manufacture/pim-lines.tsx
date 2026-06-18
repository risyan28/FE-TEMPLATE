import type { Route } from '@/routes/+types/root'
import { LineManagementPage } from '@/dashboard-user/manufacture/pim-lines'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Line Management' },
    { name: 'description', content: 'PIM Line Management' },
  ]
}

export default function PimLinesRoute() {
  return <LineManagementPage />
}
