'use client'

import { useState } from 'react'
import type { PimLine } from '@/types/pim'
import { PageHeader } from '@/components/production/page-header'
import { LineFormDialog } from './line-form-dialog'

const DUMMY_LINES: PimLine[] = [
  { id: 'LINE-A', name: 'Cylinder Block Line', code: 'LINE-A', description: 'Production line for engine blocks', status: 'active', createdAt: '2025-12-01', updatedAt: '2025-12-01' },
  { id: 'LINE-B', name: 'Sub Assy Line', code: 'LINE-B', description: 'Sub-assembly production line', status: 'active', createdAt: '2025-12-01', updatedAt: '2025-12-01' },
  { id: 'LINE-C', name: 'Engine Line', code: 'LINE-C', description: 'Final engine assembly line', status: 'inactive', createdAt: '2025-12-01', updatedAt: '2025-12-01' },
]

export function LineManagementPage() {
  const [lines, setLines] = useState<PimLine[]>(DUMMY_LINES)
  const [formOpen, setFormOpen] = useState(false)
  const [editingLine, setEditingLine] = useState<PimLine | null>(null)

  const handleCreate = () => {
    setEditingLine(null)
    setFormOpen(true)
  }

  const handleEdit = (line: PimLine) => {
    setEditingLine(line)
    setFormOpen(true)
  }

  const handleSave = (data: { name: string; code: string; description?: string }) => {
    if (editingLine) {
      setLines((prev) =>
        prev.map((l) =>
          l.id === editingLine.id
            ? { ...l, ...data, updatedAt: new Date().toISOString() }
            : l,
        ),
      )
    } else {
      const newLine: PimLine = {
        id: data.code,
        ...data,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setLines((prev) => [...prev, newLine])
    }
    setFormOpen(false)
    setEditingLine(null)
  }

  const handleToggleStatus = (lineId: string) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? { ...l, status: l.status === 'active' ? 'inactive' : 'active', updatedAt: new Date().toISOString() }
          : l,
      ),
    )
  }

  return (
    <div className='h-screen flex flex-col'>
      <div className='flex-shrink-0 px-2 md:px-6 py-2 md:py-4'>
        <div className='flex items-center justify-between'>
          <PageHeader isLoading={false} title='Line Management' />
          <button
            onClick={handleCreate}
            className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors'
          >
            + Create Line
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='flex-1 min-h-0 px-2 md:px-6 pb-4'>
        <div className='rounded-lg border border-border overflow-hidden shadow-sm h-full flex flex-col'>
          <div className='flex bg-slate-600 text-white text-sm font-bold h-10 shrink-0'>
            <div className='flex-[3] px-4 flex items-center'>Name</div>
            <div className='flex-[2] px-4 flex items-center'>Code</div>
            <div className='flex-[2] px-4 flex items-center'>Description</div>
            <div className='flex-[1] px-4 flex items-center'>Status</div>
            <div className='flex-[2] px-4 flex items-center'>Actions</div>
          </div>

          <div className='flex-1 overflow-y-auto'>
            {lines.map((line) => (
              <div
                key={line.id}
                className='flex border-b border-slate-200 hover:bg-slate-50 transition-colors min-h-[48px] items-center'
              >
                <div className='flex-[3] px-4 font-medium text-sm'>{line.name}</div>
                <div className='flex-[2] px-4 font-mono text-sm text-slate-600'>{line.code}</div>
                <div className='flex-[2] px-4 text-sm text-slate-500 truncate'>{line.description ?? '-'}</div>
                <div className='flex-[1] px-4'>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                      line.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {line.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className='flex-[2] px-4 flex gap-2'>
                  <button
                    onClick={() => handleEdit(line)}
                    className='rounded-md bg-slate-100 px-3 py-1 text-xs font-medium hover:bg-slate-200 transition-colors'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(line.id)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      line.status === 'active'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {line.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line Form Dialog */}
      <LineFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        line={editingLine}
        onSave={handleSave}
      />
    </div>
  )
}
