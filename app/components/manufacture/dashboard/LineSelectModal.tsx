'use client'

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { LineOverviewData } from '@/types/pim'

interface LineSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lines: LineOverviewData[]
  href: string
}

const statusDot: Record<LineOverviewData['connection'], string> = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-400',
  error: 'bg-red-500',
}

export function LineSelectModal({
  open,
  onOpenChange,
  lines,
  href,
}: LineSelectModalProps) {
  const navigate = useNavigate()

  const handleSelect = (code: string) => {
    onOpenChange(false)
    navigate(`${href}?line=${code}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl p-0 gap-0 overflow-hidden'>
        <div className='px-5 pt-5 pb-3'>
          <DialogHeader>
            <DialogTitle className='text-base font-bold'>
              Select Production Line
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className='px-3 pb-3 grid grid-cols-3 sm:grid-cols-4 gap-2'>
          {lines.map((line, i) => {
            const isConnected = line.connection === 'online'

            return (
              <motion.button
                key={line.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelect(line.code)}
                className='flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-3 text-center transition-all hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 group'
              >
                {/* Status dot */}
                <span
                  className={`h-2 w-2 rounded-full ${statusDot[line.connection]}`}
                />

                {/* Line name */}
                <span className='text-xs font-bold text-foreground leading-tight line-clamp-2 min-h-[2rem] flex items-center'>
                  {line.name}
                </span>

                {/* Code */}
                <span className='text-[0.6rem] font-mono text-muted-foreground'>
                  {line.code}
                </span>
              </motion.button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
