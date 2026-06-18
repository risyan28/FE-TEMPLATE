import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface SettingFormData {
  lineName: string
  areaName: string
  wip: number
  status: 'active' | 'inactive'
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: SettingFormData | null
  onSave: (data: SettingFormData) => void
}

export function SettingFormDialog({ open, onOpenChange, data, onSave }: Props) {
  const [lineName, setLineName] = useState('')
  const [areaName, setAreaName] = useState('')
  const [wip, setWip] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  useEffect(() => {
    if (data) {
      setLineName(data.lineName)
      setAreaName(data.areaName)
      setWip(String(data.wip))
      setStatus(data.status)
    } else {
      setLineName('')
      setAreaName('')
      setWip('')
      setStatus('active')
    }
  }, [data, open])

  const isValid = lineName && areaName && wip

  const handleSave = () => {
    if (!isValid) return
    onSave({
      lineName,
      areaName,
      wip: Number(wip),
      status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{data ? 'Edit Setting' : 'Add Setting'}</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-1.5'>
            <label className='text-sm font-medium text-slate-700'>Line Name</label>
            <Input placeholder='Cylinder Block Line' value={lineName} onChange={(e) => setLineName(e.target.value)} />
          </div>

          <div className='grid gap-1.5'>
            <label className='text-sm font-medium text-slate-700'>Area Name</label>
            <Input placeholder='Block Machining' value={areaName} onChange={(e) => setAreaName(e.target.value)} />
          </div>

          <div className='grid gap-1.5'>
            <label className='text-sm font-medium text-slate-700'>WIP</label>
            <Input type='number' placeholder='100' value={wip} onChange={(e) => setWip(e.target.value)} />
          </div>

          <div className='flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3'>
            <span className='text-sm font-medium text-slate-700'>Active</span>
            <button
              type='button'
              onClick={() => setStatus((s) => (s === 'active' ? 'inactive' : 'active'))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${status === 'active' ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>{data ? 'Save' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
