'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { NavItems } from '@/lib/data'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, LogIn, Menu, X } from 'lucide-react'
import Image from 'next/image'

const Nav = () => {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isAtTop, setIsAtTop] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      setIsAtTop(currentScrollY < 10)

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <div className='relative flex justify-between items-center '>
        <motion.nav
          initial={{ y: 0 }}
          animate={{ 
            y: isVisible ? 0 : -100,
            opacity: isAtTop ? 1 : 0.98
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`fixed top-0 left-0 right-0 z-50`}
        >
          <div className="bg-white rounded-md mx-auto w-full  md:mt-0 mt-5 ">
            <div className="flex items-center justify-between  p-3 lg:px-8">
              {/* Logo */}
              <Link href="/" className="flex items-center z-50">
                
   
    <Image src="/Logo.svg" alt="logo" width={150} height={150} />
              </Link>

              {/* Desktop Navigation Items */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-2 py-1">
                {NavItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <Link key={item.path} href={item.path}>
                      <motion.span
                      
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`block px-5 py-2.5 hover:scale-103  rounded-md text-[15px] font-medium transition-all duration-300 tracking-tight ${{
                          true: 'bg-black text-white shadow-sm',
                          false: 'text-gray-700 hover:bg-white hover:text-black'
                        }[isActive]}`}
                      >
                        <span className='flex items-center gap-2'> {item.icon && <item.icon size={20} />} {item.name}</span>
                      </motion.span>
                    </Link>
                  )
                })}
              </div>

              {/* Auth Section & Mobile Menu Button */}
              <div className="flex items-center gap-4">
                {/* Desktop Auth */}
                <div className="hidden md:block">
                  {isSignedIn ? (
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: 'w-10 h-10 ring-2 ring-gray-200 hover:ring-black transition-all'
                        }
                      }}
                    />
                  ) : (
                    <SignInButton mode="modal">
                      <motion.button
                        
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2.5 cursor-pointer shadow-md hover:translate-x-2 bg-black text-white rounded-md text-[15px] font-medium transition-all duration-300  hover:shadow-md"
                      >
                       <span className='flex items-center gap-2'>Login <LogIn size={20} /></span>
                      </motion.button>
                    </SignInButton>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden z-50 p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-black" />
                  ) : (
                    <Menu className="w-6 h-6 text-black" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-3 right-3 rounded-md h-full w-[300px] bg-white shadow-2xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-black">Menu</h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={closeMobileMenu}
                    className="p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-black cursor-pointer" />
                  </motion.button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-6 px-4">
                  <nav className="flex flex-col gap-2">
                    {NavItems.map((item, index) => {
                      const isActive = pathname === item.path
                      return (
                        <motion.div
                          key={item.path}
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link href={item.path} onClick={closeMobileMenu}>
                            <motion.span
                              whileTap={{ scale: 0.95 }}
                              className={`block px-5 py-3 rounded-md text-[15px] font-medium transition-all duration-300 tracking-tight ${{
                                true: 'bg-black text-white shadow-md',
                                false: 'text-gray-700 hover:bg-gray-100 active:bg-gray-100'
                              }[isActive]}`}
                            >
                              <span className='flex items-center gap-2'> {item.icon && <item.icon size={20} />} {item.name}</span> 
                            </motion.span>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </nav>
                </div>

                {/* Mobile Auth Section */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 border-t border-gray-100"
                >
                  {isSignedIn ? (
                    <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50">
                      <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                          elements: {
                            avatarBox: 'w-10 h-10'
                          }
                        }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        My Account
                      </span>
                    </div>
                  ) : (
                    <SignInButton mode="modal">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-full px-6 py-3 cursor-pointer bg-black text-white rounded-md font-medium text-[15px] transition-all duration-300 hover:bg-gray-800 shadow-md"
                      >
                        <span className='flex items-center justify-center gap-2'>Login <LogIn size={20} /></span>
                      </motion.button>
                    </SignInButton>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Nav