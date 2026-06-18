// hooks/useMenuItems.ts
import { Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
  icon: LucideIcon | string
  label: string
  href: string
  children?: MenuItem[]
}

export function useMenuItems(): MenuItem[] {
  return [
    {
      icon: '/images/admin-panel.png',
      label: 'PIM NES',
      href: '/dashboard-user/manufacture/pim-nes',
      children: [],
    },
    {
      icon: '/images/pc.png',
      label: 'PIM Queue',
      href: '/dashboard-user/manufacture/pim-queue',
      children: [],
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/dashboard-user/manufacture/settings',
      children: [],
    },
    {
      icon: '/images/data-storage.png',
      label: 'Data Master',
      href: '/dashboard-master',
      children: [],
    },
  ]
}
