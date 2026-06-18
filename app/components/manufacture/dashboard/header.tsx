'use client'

import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HeaderProps } from './types'

export function Header({ onMenuClick }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)

  const formatDate = (date: Date) =>
    date.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

  return (
    <header className='sticky top-0 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 z-40 shadow-sm'>
      <div className='container mx-auto flex items-center justify-between px-3 md:px-4 h-12 md:h-14'>
        <div className='flex items-center gap-2 md:gap-4'>
          <Button
            variant='ghost'
            size='icon'
            className='text-white hover:bg-white/20 h-12 w-12 md:h-14 md:w-14'
            onClick={onMenuClick}
          >
            <Menu className='h-8 w-8' />
          </Button>

          <div className='hidden md:flex items-center'>
            <img
              src='/images/tmmin.png'
              alt='Toyota Logo'
              width={120}
              height={40}
              className='h-16 w-auto object-contain'
            />
          </div>
        </div>

        <div className='flex-1 mx-2'>
          <h1 className='text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis text-sm sm:text-lg md:text-3xl lg:text-4xl leading-tight text-white'>
            PI MACHINING DASHBOARD - TNGA
          </h1>
        </div>

        <div className='flex items-center gap-3'>
          <div className='md:hidden flex items-center'>
            <img
              src='/images/tmmin.png'
              alt='Toyota Logo'
              width={120}
              height={40}
              className='h-10 w-auto object-contain'
            />
          </div>
          <div className='hidden md:flex flex-col items-end justify-center text-right flex-none'>
            <span className='text-2xl font-semibold text-white'>
              {formatTime(currentTime)}
            </span>
            <span className='text-xl text-white/80'>
              {formatDate(currentTime)}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
