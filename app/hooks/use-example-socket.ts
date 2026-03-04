// hooks/use-example-socket.ts
// ─────────────────────────────────────────────────────────────────────────────
// Contoh hook untuk listen event dari WebSocket.
// Salin pattern ini untuk setiap realtime feature baru.
//
// Pattern:
//   1. subscribeRoom(roomName)  → join room di BE
//   2. socket.on(eventName, cb) → listen event
//   3. unsubscribeRoom(roomName) + socket.off() → cleanup saat unmount
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { getSocket, subscribeRoom, unsubscribeRoom } from '@/lib/socket'
import type { ExampleSocketPayload } from '@/types/example'

const ROOM = 'example-room' // Ganti dengan nama room dari backend Anda
const EVENT = 'example:update' // Ganti dengan nama event dari backend Anda

export function useExampleSocket() {
  const [data, setData] = useState<ExampleSocketPayload | null>(null)

  useEffect(() => {
    const socket = getSocket()

    // Join room
    subscribeRoom(ROOM)

    // Listen event
    const handleUpdate = (payload: ExampleSocketPayload) => {
      setData(payload)
    }

    socket.on(EVENT, handleUpdate)

    return () => {
      socket.off(EVENT, handleUpdate)
      unsubscribeRoom(ROOM)
    }
  }, [])

  return { data }
}
