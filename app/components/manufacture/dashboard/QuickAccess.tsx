'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMenuItems } from '@/hooks/useMenuItems'
import { LineSelectModal } from './LineSelectModal'
import type { LineOverviewData } from '@/types/pim'

interface QuickAccessProps {
  lines?: LineOverviewData[]
}

export function QuickAccess({ lines = [] }: QuickAccessProps) {
  const menuItems = useMenuItems()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalHref, setModalHref] = useState('')

  const handleMenuClick = (item: ReturnType<typeof useMenuItems>[number], e: React.MouseEvent) => {
    if (item.label === 'PIM Queue' && lines.length > 0) {
      e.preventDefault()
      setModalHref(item.href)
      setModalOpen(true)
    }
  }

  return (
    <div className='mb-4 px-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-bold text-gray-900'>Menu</h2>
      </div>

      <div className='grid grid-cols-4 gap-2 md:gap-3'>
        {menuItems.map((item, index) => (
          <motion.div
            key={index}
            className='w-full'
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={item.href}
              onClick={(e) => handleMenuClick(item, e)}
              className='group flex h-full min-h-[clamp(5rem,10vh,7rem)] flex-col items-center justify-center rounded-xl bg-white border border-blue-100 p-3 shadow-sm hover:border-blue-300 hover:shadow-md active:shadow-sm transition-all'
            >
              <div className='mb-2 flex aspect-square w-12 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors'>
                {typeof item.icon === 'string' ? (
                  <img
                    src={item.icon}
                    alt={item.label}
                    className='h-6 w-6 object-contain'
                  />
                ) : (
                  <item.icon className='h-6 w-6 text-gray-600 group-hover:text-blue-600' />
                )}
              </div>

              <span className='text-center text-xs md:text-sm font-semibold text-gray-800 leading-tight'>
                {item.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <LineSelectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        lines={lines}
        href={modalHref}
      />
    </div>
  )
}
