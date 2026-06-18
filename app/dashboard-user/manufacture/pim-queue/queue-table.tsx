'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { PimSequence, PimSequenceStatus } from '@/types/pim'

// Definisi warna background untuk row dan kolom NO
const ROW_BG: Record<PimSequenceStatus, string> = {
  QUEUE: 'bg-white',
  PROCESSING: 'bg-orange-100',
  COMPLETED: 'bg-green-100',
}

const NO_BG: Record<PimSequenceStatus, string> = {
  QUEUE: 'bg-slate-500',
  PROCESSING: 'bg-orange-600',
  COMPLETED: 'bg-green-600',
}

interface QueueTableProps {
  data: PimSequence[]
  // Tambahkan props filter agar komponen bisa menangani tab ALL atau filter spesifik
  filterStatus?: 'ALL' | PimSequenceStatus
}

function getStatus(printFlag: number | null): PimSequenceStatus {
  if (printFlag === 1) return 'PROCESSING'
  if (printFlag === 2) return 'COMPLETED'
  return 'QUEUE'
}

function StatusBadge({ status }: { status: PimSequenceStatus }) {
  const styles: Record<PimSequenceStatus, string> = {
    QUEUE: 'bg-slate-400 text-white',
    PROCESSING: 'bg-orange-500 text-white',
    COMPLETED: 'bg-green-600 text-white',
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-1 sm:px-2 py-0.5 text-[0.55rem] sm:text-xs font-bold ${styles[status]}`}
    >
      {status}
    </span>
  )
}

export function QueueTable({ data, filterStatus = 'ALL' }: QueueTableProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [data, filterStatus])

  const headers = [
    'NO',
    'SEQ NO ORI',
    'SEQ NO ADJ',
    'SEQ NO MAN',
    'EG VARIANT',
    'EG MODEL',
    'DATA FROM',
    'STATUS',
  ]
  const mobileHeaders = [
    'NO',
    'ORI',
    'ADJ',
    'MAN',
    'VAR',
    'POWER',
    'FROM',
    'STATUS',
  ]
  const columnWidths = ['7%', '12%', '12%', '12%', '11%', '11%', '11%', '14%']
  const mobileColumnWidths = [
    '7%',
    '10%',
    '10%',
    '10%',
    '8%',
    '11%',
    '14%',
    '18%',
  ]

  // Urutan prioritas: COMPLETED (0) -> PROCESSING (1) -> QUEUE (2)
  const STATUS_ORDER: Record<PimSequenceStatus, number> = {
    COMPLETED: 0,
    PROCESSING: 1,
    QUEUE: 2,
  }

  // 1. Filter data berdasarkan status yang dipilih
  const filteredData =
    filterStatus === 'ALL'
      ? data
      : data.filter((row) => getStatus(row.printFlag) === filterStatus)

  // 2. Urutkan data: Pertama berdasarkan Status, kedua berdasarkan SEQ NO ORI
  const sortedData = [...filteredData].sort((a, b) => {
    const statusA = getStatus(a.printFlag)
    const statusB = getStatus(b.printFlag)

    // Bandingkan urutan status
    const diff = STATUS_ORDER[statusA] - STATUS_ORDER[statusB]
    if (diff !== 0) return diff

    // Jika status sama, urutkan berdasarkan SEQ NO ORI (Ascending)
    const numA = parseInt(a.seqNoOri) || 0
    const numB = parseInt(b.seqNoOri) || 0
    return numA - numB
  })

  return (
    <div className='flex-1 rounded-lg border border-border shadow-sm flex flex-col min-h-0'>
      <div className='flex flex-col flex-1 min-h-0'>
        {/* Header */}
        <div className='flex text-sm font-bold bg-slate-600 text-white h-10 shrink-0'>
          {headers.map((header, index) => (
            <div
              key={header}
              style={{
                flexBasis: isMobile
                  ? mobileColumnWidths[index]
                  : columnWidths[index],
                flexGrow: 0,
                flexShrink: 0,
              }}
              className='min-w-0 px-1 md:px-2 text-center flex items-center justify-center text-xs md:text-sm'
            >
              <span className='hidden md:inline'>{header}</span>
              <span className='md:hidden text-[9px] leading-tight'>
                {mobileHeaders[index]}
              </span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div
          ref={containerRef}
          className='flex-1 bg-white overflow-y-auto overflow-x-auto w-full'
        >
          <AnimatePresence mode='popLayout'>
            {sortedData.map((row, index) => {
              const status = getStatus(row.printFlag)
              return (
                <motion.div
                  key={row.fid}
                  className={`flex border-b border-slate-200 transition-colors overflow-hidden ${ROW_BG[status]}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.02,
                    type: 'spring',
                    stiffness: 100,
                  }}
                  layout
                >
                  {/* NO */}
                  <div
                    style={{
                      flexBasis: isMobile
                        ? mobileColumnWidths[0]
                        : columnWidths[0],
                    }}
                    className={`min-w-0 px-1 md:px-2 py-2 text-center font-bold text-xs md:text-sm border-r border-slate-200 ${NO_BG[status]}`}
                  >
                    {index + 1}
                  </div>

                  {/* SEQ NO ORI */}
                  <div
                    style={{
                      flexBasis: isMobile
                        ? mobileColumnWidths[1]
                        : columnWidths[1],
                    }}
                    className={`min-w-0 px-1 md:px-2 py-2 text-center font-bold text-xs md:text-sm text-slate-900 border-r border-slate-200 ${ROW_BG[status]}`}
                  >
                    {row.seqNoOri}
                  </div>

                  {/* SEQ NO ADJ */}
                  <div
                    style={{
                      flexBasis: isMobile
                        ? mobileColumnWidths[2]
                        : columnWidths[2],
                    }}
                    className={`min-w-0 px-1 md:px-2 py-2 text-center font-bold text-xs md:text-sm text-slate-900 border-r border-slate-200 ${ROW_BG[status]}`}
                  >
                    {row.seqNoAdj}
                  </div>

                  {/* SEQ NO MAN */}
                  <div
                    style={{
                      flexBasis: isMobile
                        ? mobileColumnWidths[3]
                        : columnWidths[3],
                    }}
                    className={`min-w-0 px-1 md:px-2 py-2 text-center font-bold text-xs md:text-sm text-slate-900 border-r border-slate-200 ${ROW_BG[status]}`}
                  >
                    {row.seqNoMan ?? '-'}
                  </div>

                  {/* EG VAR */}
                  <div
                    style={{
                      flexBasis: isMobile
                        ? mobileColumnWidths[4]
                        : columnWidths[4],
                    }}
                    className={`min-w-0 px-1 md:px-2 py-2 text-center font-bold text-xs md:text-sm text-slate-900 border-r border-slate-200 ${ROW_BG[status]}`}
                  >
                    {row.egVarian}
                  </div>

                  {/* EG Model */}
                  <div
                    style={{
                      flexBasis: isMobile
                        ? mobileColumnWidths[5]
                        : columnWidths[5],
                    }}
                    className={`min-w-0 px-1 md:px-2 py-2 text-center font-bold text-xs md:text-sm text-slate-900 border-r border-slate-200 ${ROW_BG[status]}`}
                  >
                    {row.egPower}
                  </div>

                  {/* DATA FROM */}
                  <div
                    style={{
                      flexBasis: isMobile
                        ? mobileColumnWidths[6]
                        : columnWidths[6],
                    }}
                    className={`min-w-0 px-1 md:px-2 py-2 text-center font-bold text-xs md:text-sm text-slate-900 border-r border-slate-200 ${ROW_BG[status]}`}
                  >
                    {row.dataFrom}
                  </div>

                  {/* STATUS */}
                  <div
                    style={{
                      flexBasis: isMobile
                        ? mobileColumnWidths[7]
                        : columnWidths[7],
                    }}
                    className='min-w-0 px-1 md:px-2 py-2 text-center flex items-center justify-center'
                  >
                    <StatusBadge status={status} />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Tampilan jika data kosong setelah difilter */}
          {sortedData.length === 0 && (
            <div className='flex items-center justify-center h-32 text-slate-500 text-sm'>
              Tidak ada data yang ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
