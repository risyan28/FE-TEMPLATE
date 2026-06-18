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
import type { WipSetting, PimLine } from '@/types/pim'

interface WipFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wip: WipSetting | null
  lines: PimLine[]
  onSave: (data: { lineId: string; lineCode: string; targetWip: number; maxWip: number; description?: string }) => void
}

export function WipFormDialog({ open, onOpenChange, wip, lines, onSave }: WipFormDialogProps) {
  const [selectedLine, setSelectedLine] = useState('')
  const [targetWip, setTargetWip] = useState('')
  const [maxWip, setMaxWip] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (wip) {
      setSelectedLine(wip.lineId)
      setTargetWip(String(wip.targetWip))
      setMaxWip(String(wip.maxWip))
      setDescription(wip.description ?? '')
    } else {
      setSelectedLine(lines.length > 0 ? lines[0].id : '')
      setTargetWip('')
      setMaxWip('')
      setDescription('')
    }
  }, [wip, open, lines])

  const selectedLineData = lines.find((l) => l.id === selectedLine)
  const isFormValid = selectedLine.length > 0 && targetWip.length > 0 && maxWip.length > 0

  const handleSave = () => {
    if (!isFormValid || !selectedLineData) return
    onSave({
      lineId: selectedLine,
      lineCode: selectedLineData.code,
      targetWip: Number(targetWip),
      maxWip: Number(maxWip),
      description: description || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{wip ? 'Edit WIP Setting' : 'Create WIP Setting'}</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-2'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Line *</label>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              disabled={!!wip}
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </option>
              ))}
            </select>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Target WIP *</label>
            <Input
              type='number'
              placeholder='100'
              value={targetWip}
              onChange={(e) => setTargetWip(e.target.value)}
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Max WIP *</label>
            <Input
              type='number'
              placeholder='150'
              value={maxWip}
              onChange={(e) => setMaxWip(e.target.value)}
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Description</label>
            <Input
              placeholder='WIP setting description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            {wip ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
