type Listener = (...args: any[]) => void

interface StubSocket {
  id: string
  connected: boolean
  on: (event: string, fn: Listener) => void
  off: (event: string, fn: Listener) => void
  once: (event: string, fn: Listener) => void
  emit: (event: string, ...args: any[]) => void
  connect: () => void
  disconnect: () => void
  io: { opts: { query: Record<string, string> } }
}

function createStubSocket(): StubSocket {
  const listeners = new Map<string, Set<Listener>>()
  return {
    id: 'stub',
    connected: false,
    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event)!.add(fn)
    },
    off(event, fn) {
      listeners.get(event)?.delete(fn)
    },
    once(event, fn) {
      const wrapper = (...args: any[]) => {
        fn(...args)
        this.off(event, wrapper)
      }
      this.on(event, wrapper)
    },
    emit() {},
    connect() {},
    disconnect() {},
    io: { opts: { query: {} } },
  }
}

let socket = createStubSocket()

export const getSocket = () => socket

export const subscribeRoom = (_room: string) => {}

export const unsubscribeRoom = (_room: string) => {}

export const closeSocket = () => {
  socket = createStubSocket()
}
