// routes/dashboard/index.tsx
// ─────────────────────────────────────────────────────────
// Ganti ini dengan konten dashboard Anda.
// Contoh penggunaan useQuery, useSocket, dll sudah tersedia.
// ─────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import { exampleApi } from '@/services/exampleApi'
import { useExampleSocket } from '@/hooks/use-example-socket'
import { useSocketStatus } from '@/hooks/use-socket-status'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  // ─── Socket status indicator ───────────────────────────
  const { connected } = useSocketStatus()

  // ─── Realtime data from socket ─────────────────────────
  const { data: realtimeData } = useExampleSocket()

  // ─── REST data from API (React Query) ──────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['example-items'],
    queryFn: () => exampleApi.getItems(),
  })

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Dashboard</h1>
        <Badge variant={connected ? 'default' : 'destructive'}>
          {connected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      {/* Realtime card */}
      {realtimeData && (
        <Card>
          <CardHeader>
            <CardTitle>Realtime Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className='text-sm'>{JSON.stringify(realtimeData, null, 2)}</pre>
          </CardContent>
        </Card>
      )}

      {/* REST data */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className='h-4 w-24' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='h-8 w-full' />
                </CardContent>
              </Card>
            ))
          : data?.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className='text-sm'>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-xs text-muted-foreground'>
                    {item.description ?? '—'}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
