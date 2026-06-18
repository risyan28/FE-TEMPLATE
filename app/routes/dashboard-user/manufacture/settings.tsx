import type { Route } from '@/routes/+types/root'
import { SettingsPage } from '@/dashboard-user/manufacture/settings'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Settings' },
    { name: 'description', content: 'PIM Settings - Line, Area & WIP Configuration' },
  ]
}

export default function SettingsRoute() {
  return <SettingsPage />
}
