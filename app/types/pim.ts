export interface PimLine {
  id: string
  name: string
  code: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export type LineConnectionStatus = 'online' | 'offline' | 'error'

export interface LineOverviewData extends PimLine {
  connection: LineConnectionStatus
  target: { total: number; hv: number; conv: number }
  actual: { total: number; hv: number; conv: number }
  batchVersion: number | null
  shiftCode: string | null
  parkedCount: number
  lastActivity: string | null
}

export interface PimSequence {
  fid: number
  seqNoOri: string
  seqNoAdj: string
  seqNoMan: string | null
  egType: string
  egVarian: string
  egPower: 'HV' | 'CONV'
  prodTimeOri: string
  prodTimeAdj: string | null
  prodDate: string
  dataFrom: string
  printFlag: number | null
}

export type PimSequenceStatus = 'QUEUE' | 'PROCESSING' | 'COMPLETED'

export interface PimResume {
  total: number
  hv: number
  conv: number
}

export interface PimInjectPayload {
  insertAfterSeqNoOri: string
  qty: number
  egPower: 'HV' | 'CONV'
  reason: string
}

export interface PimClientInfo {
  lineId: string
  lineName: string
}

export interface PimArea {
  id: string
  name: string
  code: string
  lineId: string
  lineCode: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface WipSetting {
  id: string
  lineId: string
  lineCode: string
  targetWip: number
  maxWip: number
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}
