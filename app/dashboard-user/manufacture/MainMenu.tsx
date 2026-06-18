'use client'

import { LineOverviewCard } from '@/components/manufacture/dashboard/LineOverviewCard'
import { QuickAccess } from '@/components/manufacture/dashboard/QuickAccess'
import type { LineOverviewData } from '@/types/pim'

const MOCK_LINES: LineOverviewData[] = [
  {
    id: 'LINE-A', name: 'Cylinder Block Line', code: 'LINE-A',
    description: 'Production line for engine blocks', status: 'active',
    createdAt: '2025-12-01', updatedAt: '2025-12-01',
    connection: 'online',
    target: { total: 400, hv: 250, conv: 150 },
    actual: { total: 120, hv: 80, conv: 40 },
    batchVersion: 3, shiftCode: 'Shift 1',
    parkedCount: 2, lastActivity: '13:32 SEQ-045 dispatched',
  },
  {
    id: 'LINE-B', name: 'Sub Assy Line', code: 'LINE-B',
    description: 'Sub-assembly production line', status: 'active',
    createdAt: '2025-12-01', updatedAt: '2025-12-01',
    connection: 'online',
    target: { total: 350, hv: 200, conv: 150 },
    actual: { total: 98, hv: 55, conv: 43 },
    batchVersion: 2, shiftCode: 'Shift 1',
    parkedCount: 0, lastActivity: '13:30 WIP snapshot submitted',
  },
  {
    id: 'LINE-C', name: 'Engine Line', code: 'LINE-C',
    description: 'Final engine assembly line', status: 'active',
    createdAt: '2025-12-01', updatedAt: '2025-12-01',
    connection: 'error',
    target: { total: 300, hv: 180, conv: 120 },
    actual: { total: 0, hv: 0, conv: 0 },
    batchVersion: null, shiftCode: 'Shift 1',
    parkedCount: 0, lastActivity: '13:25 NES sync needed',
  },
  {
    id: 'LINE-D', name: 'Cylinder Head Line', code: 'LINE-D',
    description: 'Cylinder head machining line', status: 'active',
    createdAt: '2025-12-01', updatedAt: '2025-12-01',
    connection: 'offline',
    target: { total: 280, hv: 160, conv: 120 },
    actual: { total: 0, hv: 0, conv: 0 },
    batchVersion: null, shiftCode: null,
    parkedCount: 0, lastActivity: null,
  },
  {
    id: 'LINE-E', name: 'Crankshaft Line', code: 'LINE-E',
    description: 'Crankshaft machining line', status: 'active',
    createdAt: '2025-12-01', updatedAt: '2025-12-01',
    connection: 'online',
    target: { total: 200, hv: 120, conv: 80 },
    actual: { total: 145, hv: 90, conv: 55 },
    batchVersion: 1, shiftCode: 'Shift 1',
    parkedCount: 0, lastActivity: '13:34 SEQ-014 completed',
  },
  {
    id: 'LINE-F', name: 'Camshaft Line', code: 'LINE-F',
    description: 'Camshaft machining line', status: 'active',
    createdAt: '2025-12-01', updatedAt: '2025-12-01',
    connection: 'online',
    target: { total: 250, hv: 150, conv: 100 },
    actual: { total: 72, hv: 40, conv: 32 },
    batchVersion: 2, shiftCode: 'Shift 1',
    parkedCount: 1, lastActivity: '13:31 WIP snapshot submitted',
  },
]

export function MainMenu() {
  const totalActual = MOCK_LINES.reduce((sum, l) => sum + l.actual.total, 0)
  const totalTarget = MOCK_LINES.reduce((sum, l) => sum + l.target.total, 0)

  return (
    <div className='container mx-auto px-4 py-4'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-bold text-gray-900'>Production Lines</h2>
          <p className='text-xs text-gray-500'>
            {MOCK_LINES.length} lines · {totalActual}/{totalTarget} completed
          </p>
        </div>
      </div>

      {/* Single grid — all lines */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6'>
        {MOCK_LINES.map((line) => (
          <LineOverviewCard key={line.id} line={line} />
        ))}
      </div>

      {/* Quick access */}
      <QuickAccess lines={MOCK_LINES} />
    </div>
  )
}
