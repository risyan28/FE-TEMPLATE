'use client'

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
import type { PimLine } from '@/types/pim'

interface LineFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  line: PimLine | null
  onSave: (data: { name: string; code: string; description?: string }) => void
}

export function LineFormDialog({ open, onOpenChange, line, onSave }: LineFormDialogProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (line) {
      setName(line.name)
      setCode(line.code)
      setDescription(line.description ?? '')
    } else {
      setName('')
      setCode('')
      setDescription('')
    }
  }, [line, open])

  const isFormValid = name.length > 0 && code.length > 0

  const handleSave = () => {
    if (!isFormValid) return
    onSave({ name, code, description: description || undefined })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{line ? 'Edit Line' : 'Create Line'}</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-2'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Line Name *</label>
            <Input
              placeholder='Cylinder Block Line'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Line Code *</label>
            <Input
              placeholder='LINE-A'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!line}
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Description</label>
            <Input
              placeholder='Production line description'
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
            {line ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
