import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/production/page-header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { SettingFormDialog, type SettingFormData } from './setting-form-dialog'

interface RowData {
  id: string
  lineName: string
  areaName: string
  wip: number
  status: 'active' | 'inactive'
}

const DUMMY_ROWS: RowData[] = [
  { id: '1', lineName: 'Cylinder Block Line', areaName: 'Block Machining', wip: 100, status: 'active' },
  { id: '2', lineName: 'Cylinder Block Line', areaName: 'Head Machining', wip: 100, status: 'active' },
  { id: '3', lineName: 'Sub Assy Line', areaName: 'Sub Assy Workstation', wip: 80, status: 'active' },
  { id: '4', lineName: 'Engine Line', areaName: 'Final Assembly Station', wip: 60, status: 'inactive' },
]

export function SettingsPage() {
  const [rows, setRows] = useState<RowData[]>(DUMMY_ROWS)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RowData | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleAdd = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (row: RowData) => { setEditing(row); setFormOpen(true) }

  const handleSave = (data: SettingFormData) => {
    if (editing) {
      setRows((prev) => prev.map((r) => r.id === editing.id ? { ...r, ...data } : r))
    } else {
      setRows((prev) => [...prev, { id: String(Date.now()), ...data }])
    }
    setFormOpen(false)
    setEditing(null)
  }

  const handleDelete = (id: string) => setDeleteTarget(id)
  const confirmDelete = () => {
    if (deleteTarget) {
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget))
      setDeleteTarget(null)
    }
  }

  return (
    <div className='min-h-screen flex flex-col bg-slate-50/50'>
      <div className='flex-shrink-0 px-2 md:px-6 pt-2 md:pt-4'>
        <PageHeader isLoading={false} title='Settings' />
      </div>
      <div className='flex-shrink-0 px-2 md:px-6 pb-3 text-right'>
        <button
          onClick={handleAdd}
          className='inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-blue-800 active:shadow-sm transition-all'
        >
          <Plus className='h-4 w-4' /> Add
        </button>
      </div>

      <div className='flex-1 mx-2 md:mx-6 pb-4'>
        <div className='rounded-xl border border-slate-200 bg-white overflow-hidden'>
          <div className='flex bg-gradient-to-r from-slate-700 to-slate-600 text-white/90 text-xs font-semibold h-10 px-4'>
            <div className='w-[50px] flex items-center'>No</div>
            <div className='flex-1 flex items-center'>Line</div>
            <div className='flex-1 flex items-center'>Area</div>
            <div className='flex-1 flex items-center'>WIP</div>
            <div className='flex-1 flex items-center'>Status</div>
            <div className='flex-1 flex items-center justify-end'>Action</div>
          </div>

          <AnimatePresence mode='popLayout'>
          {rows.map((row, i) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className={`flex border-b border-slate-100 items-center text-sm px-4 ${
                i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
              }`}
              style={{ minHeight: '48px' }}
            >
              <div className='w-[50px] text-slate-400 font-mono text-xs'>{i + 1}</div>
              <div className='flex-1 font-semibold text-slate-800 truncate pr-2'>{row.lineName}</div>
              <div className='flex-1 text-slate-700 truncate pr-2'>{row.areaName}</div>
              <div className='flex-1 pr-2 font-mono text-slate-700 font-medium'>{row.wip}</div>
              <div className='flex-1 pr-2'>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
                    row.status === 'active'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${row.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                  {row.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className='flex-1 flex gap-1.5 justify-end'>
                <button
                  onClick={() => handleEdit(row)}
                  className='inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:from-blue-600 hover:to-blue-700 active:shadow-none transition-all'
                >
                  <Pencil className='h-3 w-3' /> Edit
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className='inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-400 to-red-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:from-red-500 hover:to-red-600 active:shadow-none transition-all'
                >
                  <Trash2 className='h-3 w-3' /> Delete
                </button>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>

          {rows.length === 0 && (
            <div className='flex items-center justify-center h-24 text-sm text-slate-400'>
              No settings yet. Click + Add to create one.
            </div>
          )}
        </div>
      </div>

      <SettingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        data={editing ? {
          lineName: editing.lineName,
          areaName: editing.areaName,
          wip: editing.wip,
          status: editing.status,
        } : null}
        onSave={handleSave}
      />

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete Setting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this setting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant='destructive' onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
