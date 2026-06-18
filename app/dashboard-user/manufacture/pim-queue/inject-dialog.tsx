'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { PimSequence } from '@/types/pim'

interface InjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sequences: PimSequence[]
}

export function InjectDialog({
  open,
  onOpenChange,
  sequences,
}: InjectDialogProps) {
  const [insertAfter, setInsertAfter] = useState<string>('')
  const [qty, setQty] = useState<string>('')
  const [egPower, setEgPower] = useState<string>('')
  const [reason, setReason] = useState('')

  const isFormValid = insertAfter && qty && egPower && reason.length > 0

  const handleInject = () => {
    if (!isFormValid) return
    console.log('Inject:', { insertAfter, qty, egPower, reason })
    onOpenChange(false)
    setInsertAfter('')
    setQty('')
    setEgPower('')
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Inject Sequence</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-2'>
          {/* Insert after */}
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Insert after</label>
            <Select value={insertAfter} onValueChange={setInsertAfter}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='SEQ NO ORI' />
              </SelectTrigger>
              <SelectContent>
                {sequences.map((seq) => (
                  <SelectItem key={seq.fid} value={seq.seqNoOri}>
                    {seq.seqNoOri}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* QTY */}
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>QTY</label>
            <Input
              type='number'
              min='1'
              placeholder='Jumlah sequence'
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>

          {/* EG Model */}
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>EG Model *</label>
            <Select value={egPower} onValueChange={setEgPower}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Pilih EG Model' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='HV'>HV</SelectItem>
                <SelectItem value='CONV'>CONV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Reason *</label>
            <Input
              placeholder='Alasan inject sequence'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInject} disabled={!isFormValid}>
            Inject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
