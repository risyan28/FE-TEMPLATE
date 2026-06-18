'use client'

import { motion } from 'framer-motion'

export function Footer() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className='w-full py-4 pb-20 md:pb-4 text-center text-sm md:text-base text-gray-400 border-t border-gray-100'
    >
      <p className='px-4'>
        &copy; {new Date().getFullYear()} PI MACHINING DASHBOARD -  TNGA &middot; Development by{' '}
        <a
          href='https://adaptive.co.id'
          className='text-amber-600 hover:text-amber-800 underline underline-offset-2'
          target='_blank'
          rel='noopener noreferrer'
        >
          Adaptive Automation System
        </a>{' '}
        &middot;
      </p>
    </motion.div>
  )
}
