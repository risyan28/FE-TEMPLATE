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
import type { PimArea, PimLine } from '@/types/pim'

interface AreaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  area: PimArea | null
  lines: PimLine[]
  onSave: (data: { name: string; code: string; lineId: string; lineCode: string; description?: string }) => void
}

export function AreaFormDialog({ open, onOpenChange, area, lines, onSave }: AreaFormDialogProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [selectedLine, setSelectedLine] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (area) {
      setName(area.name)
      setCode(area.code)
      setSelectedLine(area.lineId)
      setDescription(area.description ?? '')
    } else {
      setName('')
      setCode('')
      setSelectedLine(lines.length > 0 ? lines[0].id : '')
      setDescription('')
    }
  }, [area, open, lines])

  const selectedLineData = lines.find((l) => l.id === selectedLine)
  const isFormValid = name.length > 0 && code.length > 0 && selectedLine.length > 0

  const handleSave = () => {
    if (!isFormValid || !selectedLineData) return
    onSave({
      name,
      code,
      lineId: selectedLine,
      lineCode: selectedLineData.code,
      description: description || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{area ? 'Edit Area' : 'Create Area'}</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-2'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Line *</label>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              disabled={!!area}
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
            <label className='text-sm font-medium'>Area Name *</label>
            <Input
              placeholder='Production Area 1'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Area Code *</label>
            <Input
              placeholder='AREA-1'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!area}
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Description</label>
            <Input
              placeholder='Area description'
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
            {area ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
