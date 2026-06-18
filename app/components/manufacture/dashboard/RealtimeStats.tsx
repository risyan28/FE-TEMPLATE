import {
  PlayCircle,
  ListOrdered,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react'
import { motion } from 'framer-motion'

type Props = {
  currentSeq: string
  queueCount: number
  completedCount: number
  parkedCount: number
  totalCount: number
}

const statConfig: {
  key: string
  label: string
  icon: typeof PlayCircle
  value: (p: Props) => string
  unit: string
  iconBg: string
  iconColor: string
}[] = [
  { key: 'current', label: 'Current Sequence', icon: PlayCircle, value: (p) => p.currentSeq, unit: '', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { key: 'queue', label: 'In Queue', icon: ListOrdered, value: (p) => `${p.queueCount}`, unit: 'seq', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, value: (p) => `${p.completedCount}`, unit: 'seq', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { key: 'parked', label: 'Parked / Error', icon: AlertTriangle, value: (p) => `${p.parkedCount}`, unit: 'seq', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { key: 'total', label: 'Total Queue', icon: Layers, value: (p) => `${p.totalCount}`, unit: 'seq', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
]

export function RealtimeStats(props: Props) {
  return (
    <div className='mb-4'>
      <div className='container mx-auto px-4 py-4'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg md:text-xl font-bold text-gray-900'>Realtime Monitoring</h2>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4'>
          {statConfig.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.key}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className='rounded-xl bg-white border border-gray-100 p-4 shadow-sm'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}>
                    <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                  <span className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    {stat.label}
                  </span>
                </div>
                <div className='flex items-baseline gap-1.5'>
                  <span className='text-2xl font-bold text-gray-900 font-mono'>
                    {stat.value(props)}
                  </span>
                  {stat.unit && (
                    <span className='text-xs text-gray-400'>{stat.unit}</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
