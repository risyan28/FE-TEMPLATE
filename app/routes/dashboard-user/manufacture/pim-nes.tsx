import type { Route } from '@/routes/+types/root'
import { PimNesPage } from '@/dashboard-user/manufacture/pim-nes'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'PIM NES' },
    { name: 'description', content: 'PIM NES - Source of Truth' },
  ]
}

export default function PimNesRoute() {
  return <PimNesPage />
}
