// services/exampleApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// Contoh REST service menggunakan createApi() dari lib/api.ts.
// Salin pattern ini untuk setiap resource/modul baru.
// ─────────────────────────────────────────────────────────────────────────────

import { createApi } from '@/lib/api'
import type { ExampleItem, CreateExampleItem } from '@/types/example'

const api = createApi()

export const exampleApi = {
  /**
   * GET /example → list semua items
   */
  getItems: async (): Promise<ExampleItem[]> => {
    const { data } = await api.get<ExampleItem[]>('/example')
    return data
  },

  /**
   * GET /example/:id → detail satu item
   */
  getItem: async (id: number): Promise<ExampleItem> => {
    const { data } = await api.get<ExampleItem>(`/example/${id}`)
    return data
  },

  /**
   * POST /example → buat item baru
   */
  createItem: async (payload: CreateExampleItem): Promise<ExampleItem> => {
    const { data } = await api.post<ExampleItem>('/example', payload)
    return data
  },

  /**
   * PUT /example/:id → update item
   */
  updateItem: async (
    id: number,
    payload: Partial<CreateExampleItem>,
  ): Promise<ExampleItem> => {
    const { data } = await api.put<ExampleItem>(`/example/${id}`, payload)
    return data
  },

  /**
   * DELETE /example/:id → hapus item
   */
  deleteItem: async (id: number): Promise<void> => {
    await api.delete(`/example/${id}`)
  },
}
