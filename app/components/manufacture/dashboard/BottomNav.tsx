import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Grid } from 'lucide-react'
import type { BottomNavProps } from './types'
import type { LineOverviewData } from '@/types/pim'
import { useMenuItems } from '@/hooks/useMenuItems'
import { MobileMenuSheet } from './MobileMenuSheet'

interface ExtendedBottomNavProps extends BottomNavProps {
  lines?: LineOverviewData[]
}

export function BottomNav({ lines = [] }: ExtendedBottomNavProps) {
  const menuItems = useMenuItems()
  const [sheetOpen, setSheetOpen] = useState(false)

  const half = Math.ceil(menuItems.length / 2)
  const leftItems = menuItems.slice(0, half)
  const rightItems = menuItems.slice(half)

  return (
    <div className='fixed bottom-0 left-0 right-0 border-t bg-white shadow-lg md:hidden z-50'>
      <div className='flex justify-around items-center px-2 py-2 pb-safe'>
        {leftItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className='flex flex-col items-center gap-1 text-gray-500 min-w-[56px]'
          >
            <div className='flex h-7 w-7 items-center justify-center'>
              {typeof item.icon === 'string' ? (
                <img src={item.icon} alt={item.label} className='h-5 w-5 object-contain' />
              ) : (
                <item.icon className='h-5 w-5' />
              )}
            </div>
            <span className='text-[9px] font-medium text-center leading-tight'>
              {item.label}
            </span>
          </Link>
        ))}

        <button
          onClick={() => setSheetOpen(true)}
          className='flex flex-col items-center gap-1 focus:outline-none -mt-4 min-w-[56px]'
        >
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-toyota-red text-white shadow-lg'>
            <Grid className='h-5 w-5' />
          </div>
          <span className='text-[9px] font-semibold text-toyota-red-dark'>Menu</span>
        </button>

        {rightItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className='flex flex-col items-center gap-1 text-gray-500 min-w-[56px]'
          >
            <div className='flex h-7 w-7 items-center justify-center'>
              {typeof item.icon === 'string' ? (
                <img src={item.icon} alt={item.label} className='h-5 w-5 object-contain' />
              ) : (
                <item.icon className='h-5 w-5' />
              )}
            </div>
            <span className='text-[9px] font-medium text-center leading-tight'>
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      <MobileMenuSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        lines={lines}
      />
    </div>
  )
}
