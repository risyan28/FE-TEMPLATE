'use client'

import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useMenuItems } from '@/hooks/useMenuItems'
import { useState } from 'react'
import { LineSelectModal } from './LineSelectModal'
import type { LineOverviewData } from '@/types/pim'

interface MobileMenuSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lines?: LineOverviewData[]
}

export function MobileMenuSheet({
  open,
  onOpenChange,
  lines = [],
}: MobileMenuSheetProps) {
  const navigate = useNavigate()
  const menuItems = useMenuItems()
  const [lineModalOpen, setLineModalOpen] = useState(false)

  const handleSelect = (href: string, label: string) => {
    if (label === 'PIM Queue' && lines.length > 0) {
      setLineModalOpen(true)
      return
    }
    onOpenChange(false)
    navigate(href)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-50 bg-black/30'
              onClick={() => onOpenChange(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl'
            >
              {/* Handle */}
              <div className='flex justify-center pt-3 pb-1'>
                <div className='h-1 w-10 rounded-full bg-gray-300' />
              </div>

              {/* Header */}
              <div className='flex items-center justify-between px-5 pb-3'>
                <h3 className='text-base font-bold text-gray-900'>Menu</h3>
                <button
                  onClick={() => onOpenChange(false)}
                  className='p-1.5 rounded-full hover:bg-gray-100 transition-colors'
                >
                  <X className='h-4 w-4 text-gray-500' />
                </button>
              </div>

              {/* Menu grid */}
              <div className='px-5 pb-8 grid grid-cols-3 gap-3'>
                {menuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(item.href, item.label)}
                    className='flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-blue-50 hover:border-blue-200'
                  >
                    {typeof item.icon === 'string' ? (
                      <img
                        src={item.icon}
                        alt={item.label}
                        className='h-8 w-8 object-contain'
                      />
                    ) : (
                      <item.icon className='h-7 w-7 text-gray-600' />
                    )}
                    <span className='text-xs font-semibold text-gray-700 text-center leading-tight'>
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LineSelectModal
        open={lineModalOpen}
        onOpenChange={setLineModalOpen}
        lines={lines}
        href='/dashboard-user/manufacture/pim-queue'
      />
    </>
  )
}
