'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  RefreshCw,
  Database,
  Clock,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Pentagon,
} from 'lucide-react'
import type { PimSequence, PimSequenceStatus } from '@/types/pim'
import { PageHeader } from '@/components/production/page-header'
import { QueueTable } from '../pim-queue/queue-table'

const EG_VARIANTS = [
  '031',
  '263',
  '155',
  '168',
  '042',
  '187',
  '073',
  '221',
  '094',
  '306',
]
const EG_TYPES = ['2NR', '1NR']
const EG_POWERS: ('HV' | 'CONV')[] = ['HV', 'CONV']
const PAGE_SIZES = [100, 200, 500, 1000]

function generateShiftData(): PimSequence[] {
  const data: PimSequence[] = []
  const shiftDate = '2025-12-26'

  // Kita set agar ~40% data sudah COMPLETED biar progress bar kelihatan jelas
  const COMPLETED_UNTIL = 320
  const PROCESSING_UNTIL = 321 // Sisanya yang sedikit jadi PROCESSING

  for (let i = 1; i <= 800; i++) {
    const egPower = EG_POWERS[i % 2]
    const egType = egPower === 'HV' ? EG_TYPES[1] : EG_TYPES[0]

    let printFlag: number | null = null
    if (i <= COMPLETED_UNTIL) {
      printFlag = 2 // COMPLETED
    } else if (i <= PROCESSING_UNTIL) {
      printFlag = 1 // PROCESSING
    }
    // Sisanya (341 - 800) akan null (QUEUE)

    const seqOri = String(i).padStart(3, '0')
    const seqAdj = String(i).padStart(3, '0')

    const seconds = (i - 1) * 32
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    const time = `${String(6 + Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

    data.push({
      fid: i,
      seqNoOri: seqOri,
      seqNoAdj: seqAdj,
      seqNoMan: null,
      egType,
      egVarian: EG_VARIANTS[i % EG_VARIANTS.length],
      egPower,
      prodTimeOri: `${shiftDate}T${time}`,
      prodTimeAdj: null,
      prodDate: shiftDate,
      dataFrom: 'PI',
      printFlag,
    })
  }

  return data
}

const SHIFT_DATA = generateShiftData()

function getStatus(printFlag: number | null): PimSequenceStatus {
  if (printFlag === 1) return 'PROCESSING'
  if (printFlag === 2) return 'COMPLETED'
  return 'QUEUE'
}

// 1. Definisi prioritas urutan status
const STATUS_ORDER: Record<PimSequenceStatus, number> = {
  COMPLETED: 0,
  PROCESSING: 1,
  QUEUE: 2,
}

const STATUS_OPTIONS: { label: string; value: PimSequenceStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Queue', value: 'QUEUE' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed', value: 'COMPLETED' },
]

const POWER_OPTIONS: { label: string; value: 'ALL' | 'HV' | 'CONV' }[] = [
  { label: 'All Variants', value: 'ALL' },
  { label: 'HV', value: 'HV' },
  { label: 'CONV', value: 'CONV' },
]

function StatCard({
  label,
  value,
  progress,
  accent,
  icon,
}: {
  label: string
  value: string | number
  progress?: { current: number; total: number }
  accent?: 'blue' | 'emerald' | 'default'
  icon?: React.ReactNode
}) {
  const percentage = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  const gradients = {
    blue: 'from-sky-500 to-blue-600',
    emerald: 'from-emerald-500 to-teal-600',
    default: 'from-slate-700 to-neutral-800',
  }

  const bgGradients = {
    blue: 'from-sky-50/50 to-blue-50/50',
    emerald: 'from-emerald-50/50 to-teal-50/50',
    default: 'from-slate-50/50 to-neutral-50/50',
  }

  const borderColors = {
    blue: 'border-sky-200 hover:border-sky-300',
    emerald: 'border-emerald-200 hover:border-emerald-300',
    default: 'border-slate-200 hover:border-slate-300',
  }

  return (
    <motion.div
      whileHover={{ y: -1, transition: { duration: 0.2 } }}
      className={`flex-shrink-0 min-w-[160px] sm:min-w-[180px] flex-1 rounded-lg border ${borderColors[accent ?? 'default']} bg-gradient-to-br ${bgGradients[accent ?? 'default']} p-2.5 shadow-sm hover:shadow-md transition-all duration-200`}
    >
      {/* Header dengan Icon */}
      <div className='flex items-center justify-between mb-1.5'>
        <div className='text-[0.6rem] font-bold text-muted-foreground tracking-wider uppercase'>
          {label}
        </div>
        {icon && (
          <div
            className={`p-1 rounded bg-gradient-to-br ${gradients[accent ?? 'default']} text-white`}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Target Value */}
      <div
        className={`text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r ${gradients[accent ?? 'default']} bg-clip-text text-transparent leading-none`}
      >
        {value}
      </div>

      {/* Progress Section */}
      {progress && (
        <div className='mt-2 space-y-1'>
          <div className='flex items-center justify-between'>
            <div className='flex items-baseline gap-0.5'>
              <span className='text-sm font-bold text-foreground'>
                {progress.current}
              </span>
              <span className='text-[0.6rem] text-muted-foreground font-medium'>
                / {progress.total}
              </span>
            </div>
            <div
              className={`text-xs font-black ${percentage >= 100 ? 'text-green-600' : 'text-foreground'}`}
            >
              {percentage}%
            </div>
          </div>

          {/* Progress Bar lebih tipis */}
          <div className='relative h-1.5 bg-muted/60 rounded-full overflow-hidden'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradients[accent ?? 'default']} rounded-full`}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

export function PimNesPage() {
  const [statusFilter, setStatusFilter] = useState<PimSequenceStatus | 'ALL'>(
    'ALL',
  )
  const [powerFilter, setPowerFilter] = useState<'ALL' | 'HV' | 'CONV'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [pageSize, setPageSize] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const tableRef = useRef<HTMLDivElement>(null)

  // Target produksi harian (bisa dari API/database)
  const TARGET_TOTAL = 800
  const TARGET_HV = 400
  const TARGET_CONV = 400

  const total = SHIFT_DATA.length
  const hv = SHIFT_DATA.filter((s) => s.egPower === 'HV').length
  const conv = SHIFT_DATA.filter((s) => s.egPower === 'CONV').length

  // Hitung yang sudah COMPLETE (printFlag === 2)
  const hvCompleted = SHIFT_DATA.filter(
    (s) => s.egPower === 'HV' && s.printFlag === 2,
  ).length
  const convCompleted = SHIFT_DATA.filter(
    (s) => s.egPower === 'CONV' && s.printFlag === 2,
  ).length
  const totalCompleted = hvCompleted + convCompleted

  // 2. Filter data terlebih dahulu
  const filteredData = useMemo(() => {
    return SHIFT_DATA.filter((row) => {
      if (statusFilter !== 'ALL' && getStatus(row.printFlag) !== statusFilter)
        return false
      if (powerFilter !== 'ALL' && row.egPower !== powerFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !row.seqNoOri.toLowerCase().includes(q) &&
          !row.seqNoAdj.toLowerCase().includes(q) &&
          !(row.seqNoMan ?? '').toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [statusFilter, powerFilter, searchQuery])

  // 3. Urutkan data HASIL FILTER sebelum di-pagination
  // Ini memastikan urutan COMPLETED -> PROCESSING -> QUEUE berlaku global (antar halaman)
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const statusA = getStatus(a.printFlag)
      const statusB = getStatus(b.printFlag)

      // Bandingkan urutan status berdasarkan prioritas
      const diff = STATUS_ORDER[statusA] - STATUS_ORDER[statusB]
      if (diff !== 0) return diff

      // Jika status sama, urutkan berdasarkan SEQ NO ORI (Ascending)
      const numA = parseInt(a.seqNoOri) || 0
      const numB = parseInt(b.seqNoOri) || 0
      return numA - numB
    })
  }, [filteredData])

  // Gunakan sortedData.length untuk kalkulasi halaman
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (safeCurrentPage > 3) pages.push('...')
    const start = Math.max(2, safeCurrentPage - 1)
    const end = Math.min(totalPages - 1, safeCurrentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (safeCurrentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  // 4. Pagination dilakukan pada data yang SUDAH diurutkan
  const pagedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, safeCurrentPage, pageSize])

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1)
  }, [])

  function jumpToProcessing() {
    setStatusFilter('PROCESSING')
    setPowerFilter('ALL')
    setSearchQuery('')
    setCurrentPage(1)
    tableRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='fixed inset-0 flex flex-col bg-background'>
      <div className='flex-shrink-0 px-2 md:px-6 py-2 md:py-4'>
        <PageHeader isLoading={false} title='PI-NES Sequence' />
      </div>

      {/* Summary */}
      <div className='flex-shrink-0 px-2 -mt-6 md:px-6 pb-2 '>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className='flex flex-col lg:flex-row items-stretch lg:items-end gap-2'
        >
          {/* Stats Group - Lebih Compact */}
          <div className='flex gap-2 sm:gap-3 flex-1 min-w-0 overflow-x-auto sm:overflow-visible'>
            <StatCard
              label='Total Target'
              value={TARGET_TOTAL}
              progress={{ current: totalCompleted, total: TARGET_TOTAL }}
              accent='default'
              icon={<Database className='h-3.5 w-3.5' />}
            />

            <StatCard
              label='HV'
              value={TARGET_HV}
              progress={{ current: hvCompleted, total: TARGET_HV }}
              accent='blue'
              icon={<Zap className='h-3.5 w-3.5' />}
            />

            <StatCard
              label='CONV'
              value={TARGET_CONV}
              progress={{ current: convCompleted, total: TARGET_CONV }}
              accent='emerald'
              icon={<Pentagon className='h-3.5 w-3.5' />}
            />
          </div>

          {/* Sync Action */}
          <div className='flex flex-col items-end justify-end gap-1 shrink-0'>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='flex items-center justify-center gap-1.5 rounded-lg bg-neutral-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-700 transition-colors'
            >
              <RefreshCw className='h-3.5 w-3.5' />
              Sync NES
            </motion.button>
            <div className='flex items-center gap-1 text-[0.6rem] text-muted-foreground/60'>
              <Clock className='h-3 w-3' />
              <span>Last Sync: 10:32 AM</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Table section */}
      <div className='flex-1 min-h-0 px-2 md:px-6 pb-4 flex flex-col overflow-hidden'>
        <div className='flex-shrink-0 flex items-center gap-2 mb-2 text-xs text-muted-foreground/70 font-medium'>
          <Database className='h-3.5 w-3.5' />
          <span>Sequence PI NES</span>
          <span className='text-muted-foreground/40'>&middot;</span>
          {/* Tampilkan jumlah data yang sudah difilter & diurutkan */}
          <span className='tabular-nums'>
            {sortedData.length} of {total} records
          </span>
          <span className='text-muted-foreground/40'>&middot;</span>
          <span className='tabular-nums'>Shift: Day / Night</span>
        </div>

        {/* Filters bar */}
        <div className='flex-shrink-0 flex flex-wrap items-center gap-2 mb-2 pb-2 border-b border-border/40'>
          {/* Left: filters */}
          <div className='flex items-center gap-2 flex-wrap flex-1 min-w-0'>
            <div className='flex items-center gap-1 bg-muted/50 rounded-lg p-0.5'>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStatusFilter(opt.value)
                    handleFilterChange()
                  }}
                  className={`px-2.5 py-1 text-[0.65rem] font-medium rounded-md transition-colors ${
                    statusFilter === opt.value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <select
              value={powerFilter}
              onChange={(e) => {
                setPowerFilter(e.target.value as 'ALL' | 'HV' | 'CONV')
                handleFilterChange()
              }}
              className='rounded-lg border border-border/60 bg-transparent px-2.5 py-1 text-[0.65rem] font-medium text-foreground outline-none'
            >
              {POWER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className='relative flex-1 min-w-[120px] max-w-[200px]'>
              <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50' />
              <input
                type='text'
                placeholder='Search seq...'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleFilterChange()
                }}
                className='w-full rounded-lg border border-border/60 bg-transparent pl-7 pr-2 py-1 text-[0.65rem] font-medium text-foreground outline-none placeholder:text-muted-foreground/40'
              />
            </div>

            <button
              onClick={jumpToProcessing}
              className='flex items-center gap-1 rounded-lg border border-orange-300/50 px-2.5 py-1 text-[0.65rem] font-medium text-orange-700 hover:bg-orange-50 transition-colors'
            >
              <ArrowUpDown className='h-3 w-3' />
              Jump to Processing
            </button>
          </div>

          {/* Right: show + pagination */}
          <div className='flex items-center gap-2 shrink-0'>
            <div className='flex items-center gap-1.5 text-[0.65rem] text-muted-foreground'>
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  handleFilterChange()
                }}
                className='rounded-lg border border-border/60 bg-transparent px-2 py-1 text-[0.65rem] font-medium text-foreground outline-none'
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex items-center gap-1'>
              <button
                onClick={() => {
                  setCurrentPage(Math.max(1, safeCurrentPage - 1))
                  tableRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={safeCurrentPage <= 1}
                className='p-1 rounded hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors'
              >
                <ChevronLeft className='h-3.5 w-3.5' />
              </button>
              {pages.map((p, i) =>
                p === '...' ? (
                  <span
                    key={`dots-${i}`}
                    className='px-1 text-xs text-muted-foreground'
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => {
                      setCurrentPage(p)
                      tableRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`min-w-[28px] h-7 rounded text-xs font-medium transition-colors ${
                      safeCurrentPage === p
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => {
                  setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))
                  tableRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={safeCurrentPage >= totalPages}
                className='p-1 rounded hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors'
              >
                <ChevronRight className='h-3.5 w-3.5' />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div ref={tableRef} className='flex-1 min-h-0 flex flex-col'>
          {/* Kirimkan filterStatus agar QueueTable bisa menampilkan warna/highlight yang konsisten */}
          <QueueTable data={pagedData} filterStatus={statusFilter} />
        </div>
      </div>
    </div>
  )
}
