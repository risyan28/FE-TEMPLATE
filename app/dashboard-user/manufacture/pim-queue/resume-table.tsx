'use client'

import { motion } from 'framer-motion'

interface ResumeTableProps {
  total: number
  hv: number
  conv: number
  onInjectClick?: () => void
}

export function ResumeTable({ total, hv, conv, onInjectClick }: ResumeTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4'
    >
      <div className='flex gap-3 sm:gap-4 flex-1'>
        <div className='flex-1 rounded-lg border border-border bg-card p-3 sm:p-4 shadow-sm text-center'>
          <div className='text-xs sm:text-sm text-muted-foreground font-medium'>TOTAL</div>
          <div className='text-xl sm:text-3xl font-bold mt-1'>{total}</div>
        </div>
        <div className='flex-1 rounded-lg border border-border bg-card p-3 sm:p-4 shadow-sm text-center'>
          <div className='text-xs sm:text-sm text-muted-foreground font-medium'>HV</div>
          <div className='text-xl sm:text-3xl font-bold mt-1 text-blue-600'>{hv}</div>
        </div>
        <div className='flex-1 rounded-lg border border-border bg-card p-3 sm:p-4 shadow-sm text-center'>
          <div className='text-xs sm:text-sm text-muted-foreground font-medium'>CONV</div>
          <div className='text-xl sm:text-3xl font-bold mt-1 text-emerald-600'>{conv}</div>
        </div>
      </div>
      <button
        onClick={onInjectClick}
        className='flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-md hover:bg-blue-700 transition-colors whitespace-nowrap'
      >
        Inject Sequence
      </button>
    </motion.div>
  )
}
