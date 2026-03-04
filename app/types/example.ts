// types/example.ts
// ─────────────────────────────────────────────────────────────────────────────
// Contoh type definitions.
// Ganti/tambah sesuai kebutuhan project baru.
// ─────────────────────────────────────────────────────────────────────────────

export interface ExampleItem {
  id: number
  name: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
}

export interface CreateExampleItem {
  name: string
  description?: string
  status?: 'active' | 'inactive'
}

/**
 * Contoh payload yang diterima dari WebSocket event.
 * Sesuaikan dengan event name dan shape dari backend Anda.
 */
export interface ExampleSocketPayload {
  event: string
  data: unknown
  timestamp: string
}
