'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/manufacture/dashboard/sidebar'
import { Header } from '@/components/manufacture/dashboard/header'
import { BottomNav } from '@/components/manufacture/dashboard/BottomNav'
import { motion } from 'framer-motion'
import { Footer } from '@/components/manufacture/dashboard/Footer'
import { AnimatePresence } from 'framer-motion'
import { LoadingScreen } from '@/components/loading-screen'
import { NavigationHandler } from '@/components/navigation-handler'
import { MainMenu } from './MainMenu'
import { SafetyCompliance } from '@/components/manufacture/dashboard/SafetyCompliance'
import type { LineOverviewData } from '@/types/pim'

const MOCK_LINES: LineOverviewData[] = [
  { id: 'LINE-A', name: 'Cylinder Block Line', code: 'LINE-A', description: 'Production line for engine blocks', status: 'active', createdAt: '2025-12-01', updatedAt: '2025-12-01', connection: 'online', target: { total: 400, hv: 250, conv: 150 }, actual: { total: 120, hv: 80, conv: 40 }, batchVersion: 3, shiftCode: 'Shift 1', parkedCount: 2, lastActivity: '13:32 SEQ-045 dispatched' },
  { id: 'LINE-B', name: 'Sub Assy Line', code: 'LINE-B', description: 'Sub-assembly production line', status: 'active', createdAt: '2025-12-01', updatedAt: '2025-12-01', connection: 'online', target: { total: 350, hv: 200, conv: 150 }, actual: { total: 98, hv: 55, conv: 43 }, batchVersion: 2, shiftCode: 'Shift 1', parkedCount: 0, lastActivity: '13:30 WIP snapshot submitted' },
  { id: 'LINE-C', name: 'Engine Line', code: 'LINE-C', description: 'Final engine assembly line', status: 'active', createdAt: '2025-12-01', updatedAt: '2025-12-01', connection: 'error', target: { total: 300, hv: 180, conv: 120 }, actual: { total: 0, hv: 0, conv: 0 }, batchVersion: null, shiftCode: 'Shift 1', parkedCount: 0, lastActivity: '13:25 NES sync needed' },
  { id: 'LINE-D', name: 'Cylinder Head Line', code: 'LINE-D', description: 'Cylinder head machining line', status: 'active', createdAt: '2025-12-01', updatedAt: '2025-12-01', connection: 'offline', target: { total: 280, hv: 160, conv: 120 }, actual: { total: 0, hv: 0, conv: 0 }, batchVersion: null, shiftCode: null, parkedCount: 0, lastActivity: null },
  { id: 'LINE-E', name: 'Crankshaft Line', code: 'LINE-E', description: 'Crankshaft machining line', status: 'active', createdAt: '2025-12-01', updatedAt: '2025-12-01', connection: 'online', target: { total: 200, hv: 120, conv: 80 }, actual: { total: 145, hv: 90, conv: 55 }, batchVersion: 1, shiftCode: 'Shift 1', parkedCount: 0, lastActivity: '13:34 SEQ-014 completed' },
  { id: 'LINE-F', name: 'Camshaft Line', code: 'LINE-F', description: 'Camshaft machining line', status: 'active', createdAt: '2025-12-01', updatedAt: '2025-12-01', connection: 'online', target: { total: 250, hv: 150, conv: 100 }, actual: { total: 72, hv: 40, conv: 32 }, batchVersion: 2, shiftCode: 'Shift 1', parkedCount: 1, lastActivity: '13:31 WIP snapshot submitted' },
]

export function DashboardLayout(): React.ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [key, setKey] = useState(Date.now())

  // Set loading to false after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Force re-render when navigation happens
  const handleNavigation = () => {
    // Force a re-render of the layout and all children
    setIsLoading(true)
    setKey(Date.now())

    // Reset loading state after a short delay
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className='flex min-h-screen flex-col bg-surface'>
      {/* Navigation Handler */}
      <NavigationHandler onNavigate={handleNavigation} />

      {/* Loading Screen - Only shown during loading */}
      {isLoading && <LoadingScreen />}

      {/* Only show the actual layout when not loading */}
      {!isLoading && (
        <>
          {/* Overlay for when sidebar is open */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-20 bg-black/20'
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Component */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className='flex flex-1 flex-col'>
            {/* Header Component */}
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <AnimatePresence mode='wait'>
              <motion.main
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className='flex-1'
              >
                <MainMenu />
              </motion.main>
            </AnimatePresence>

            <SafetyCompliance />
            {/* Footer Component */}
            <Footer />
          </div>

          <BottomNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} lines={MOCK_LINES} />
        </>
      )}
    </div>
  )
}
