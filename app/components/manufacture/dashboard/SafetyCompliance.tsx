import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'

export function SafetyCompliance() {
  return (
    <motion.div
      className='w-full'
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      <div className='container mx-auto mb-20 md:mb-6 px-4'>
        <div className='flex h-24 md:h-32 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 p-3 md:p-6'>
          <div className='flex w-full flex-row items-center justify-center gap-3 md:gap-6 text-center'>
            <div className='flex h-12 w-12 md:h-24 md:w-24 items-center justify-center rounded-full bg-amber-100 flex-shrink-0'>
              <ShieldAlert className='h-6 w-6 md:h-16 md:w-16 text-amber-600' />
            </div>

            <div className='flex-1'>
              <h2 className='text-sm md:text-xl lg:text-4xl font-semibold text-amber-900 leading-tight'>
                Safety & Compliance
              </h2>
              <p className='text-xs md:text-base lg:text-2xl text-amber-700/80'>
                Comply With Work Safety Procedures
              </p>
            </div>

            <div className='h-10 w-10 md:h-20 md:w-20 flex-shrink-0'>
              <img
                src='/images/safety-helmet.png'
                alt='Safety Helmet'
                className='h-full w-full object-contain opacity-80'
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
