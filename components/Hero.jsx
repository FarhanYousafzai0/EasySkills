'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ModalProvider } from './ui/Model'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'


export default function HeroSection() {
  return (
    <section className="w-[95%] mx-auto md:mt-10  flex flex-col items-center justify-center text-center  py-20 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
        
        {/* Top Tagline Button */}
       <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-4 sm:mb-6 px-4 sm:px-6 py-1.5 sm:py-2 bg-white text-black font-medium text-xs sm:text-sm md:text-base rounded-full shadow-md cursor-pointer hover:scale-105 transition whitespace-pre-line text-center"
          style={{ wordBreak: 'break-word', maxWidth: '100%' }}
        >
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#9380FD] via-[#7866FA] to-[#ECCFFE] flex-shrink-0"></div>
          <span className="truncate sm:whitespace-normal">
            Conquer YouTube using the power of AI.
          </span>
        </motion.span>

        

        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="w-full border p-2  max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="relative w-full aspect-video bg-black/20 rounded-2xl overflow-hidden">
            <iframe
              className="absolute inset-0 w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>
<motion.div 
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.8, duration: 0.6 }}
  className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5"
>
 
<Link href='/enroll'>
<motion.button
                        
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2.5 cursor-pointer shadow-md hover:scale-105    text-white  bg-gradient-to-r from-[#9380FD] to-[#7866FA] rounded-md text-[15px] font-medium transition-all duration-300  hover:shadow-md"
                      >
                       <span className='flex items-center gap-2'>Enroll Now <ArrowRight size={20} /></span>
                      </motion.button>
</Link>




                     
  
</motion.div>



      </div>
    </section>
  )
}
