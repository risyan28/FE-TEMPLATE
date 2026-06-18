'use client'

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { LineOverviewData } from '@/types/pim'

interface Props {
  line: LineOverviewData
}

const statusDot: Record<LineOverviewData['connection'], string> = {
  online: 'bg-emerald-500',
  offline: 'bg-red-500',
  error: 'bg-red-500',
}

export function LineOverviewCard({ line }: Props) {
  const isConnected = line.connection === 'online'
  const progress =
    line.target.total > 0
      ? Math.min((line.actual.total / line.target.total) * 100, 100)
      : 0

  return (
    <motion.div
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      className='h-full'
    >
      <Link
        to={`/dashboard-user/manufacture/pim-queue?line=${line.code}`}
        className={`flex flex-col h-full rounded-xl border p-4 transition-colors ${
          isConnected
            ? 'bg-white border-blue-100 hover:border-blue-200'
            : 'bg-white border-red-200 hover:bg-red-50/50'
        }`}
      >
        {/* Header: line name + status dot */}
        <div className='flex items-center mb-3 -mt-1'>
          <span
            className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${statusDot[line.connection]} mr-2`}
          />
          <h3 className='text-lg font-bold text-gray-900 truncate'>
            {line.name}
          </h3>
        </div>

        {/* Line code */}
        <p className='text-sm font-mono text-gray-400 mb-3 text-center'>
          {line.code}
        </p>

        {/* Target & Actual — HV / CONV */}
        <div className='flex justify-between items-start mb-3'>
          {/* Target — kiri */}
          <div>
            <p className='text-xs text-gray-400 uppercase tracking-wider mb-0.5 text-center'>
              Target
            </p>
            <p className='text-2xl font-bold text-gray-900 font-mono leading-none mb-3 text-center'>
              {line.target.total}
            </p>
            <div className='flex gap-3 text-xs'>
              <div>
                <p className='text-blue-600 font-medium text-center'>HV</p>
                <p className='text-blue-600 font-bold font-mono text-center'>
                  {line.target.hv}
                </p>
              </div>
              <div>
                <p className='text-emerald-600 font-medium'>CONV</p>
                <p className='text-emerald-600 font-bold font-mono text-center'>
                  {line.target.conv}
                </p>
              </div>
            </div>
          </div>

          {/* Actual — kanan */}
          <div className='text-center'>
            <p className='text-xs text-gray-400 uppercase tracking-wider mb-0.5 text-center'>
              Actual
            </p>
            <p className='text-2xl font-bold text-gray-900 font-mono leading-none mb-3'>
              {line.actual.total}
            </p>
            <div className='flex gap-3 text-xs'>
              <div>
                <p className='text-blue-600 font-medium text-center'>HV</p>
                <p className='text-blue-600 font-bold font-mono text-center'>
                  {line.actual.hv}
                </p>
              </div>
              <div>
                <p className='text-emerald-600 font-medium text-center'>CONV</p>
                <p className='text-emerald-600 font-bold font-mono text-center'>
                  {line.actual.conv}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer push bottom content down */}
        <div className='flex-1' />

        {/* Bottom: status or progress */}
        {!isConnected ? (
          <div className='text-sm text-red-500 font-medium mt-auto'>
            Line Down
          </div>
        ) : (
          <div className='flex items-center gap-2 mt-auto'>
            <div className='relative flex-1 h-4 bg-blue-100 rounded-full overflow-hidden'>
              <div
                className='h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full'
                style={{ width: `${progress}%` }}
              />
              <span
                className='absolute top-1/2 text-[10px] font-bold text-white drop-shadow-sm pointer-events-none whitespace-nowrap'
                style={{
                  left: `${progress / 2}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <span className='text-sm text-gray-400 font-mono whitespace-nowrap'>
              {line.actual.total}/{line.target.total}
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  )
}
