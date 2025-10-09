'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { NavItems } from '@/lib/data'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

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
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset'
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <div className='relative flex justify-between items-center h-[80px] '>
        <motion.nav
          initial={{ y: 0 }}
          animate={{
            y: isVisible ? 0 : -100,
            opacity: isAtTop ? 1 : 0.98
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className='fixed top-0 left-0 right-0 z-50'
        >
          <div className="bg-[#9D4EDD] mx-auto w-[95%] lg:w-[95%] mt-3 shadow-lg rounded-xl border border-[#7B2CBF]/40 backdrop-blur-sm">
            <div className="flex items-center justify-between lg:py-3 py-1 px-6 lg:px-8">
              {/* Logo */}
              <Link href="/" className="flex items-center z-50">
                <motion.div 
                  transition={{ duration: 0.2 }}
                  className="text-2xl font-bold text-white tracking-wide"
                >
                  Logo
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-2">
                {NavItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <Link key={item.path} href={item.path}>
                      <motion.span
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`block px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-white text-[#9D4EDD] shadow-md'
                            : 'text-white hover:bg-[#C77DFF] hover:text-white'
                        }`}
                      >
                        {item.name}
                      </motion.span>
                    </Link>
                  )
                })}
              </div>

              {/* Auth & Mobile Button */}
              <div className="flex items-center gap-4">
                <div className="hidden md:block">
                  {isSignedIn ? (
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: 'w-10 h-10 ring-2 ring-[#C77DFF] hover:ring-white transition-all'
                        }
                      }}
                    />
                  ) : (
                    <SignInButton mode="modal">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="px-7 py-2 bg-white text-[#9D4EDD] rounded-full font-medium shadow-md hover:shadow-lg hover:bg-[#F5F3FF] transition-all"
                      >
                        Login
                      </motion.button>
                    </SignInButton>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden z-50 p-2 rounded-lg cursor-pointer group hover:bg-[#C77DFF]/20 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-white group-hover:text-[#C77DFF]" />
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
              className="fixed top-3 rounded-md right-3 h-full w-[350px] bg-white shadow-2xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-[#9D4EDD]">Menu</h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={closeMobileMenu}
                    className="p-2 rounded-lg hover:bg-[#C77DFF]/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-[#9D4EDD]" />
                  </motion.button>
                </div>

                {/* Nav Items */}
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
                              className={`block px-5 py-3.5 rounded-xl text-base font-medium transition-all duration-300 ${
                                isActive
                                  ? 'bg-[#9D4EDD] text-white shadow-lg'
                                  : 'text-gray-700 hover:bg-[#F3E8FF] active:bg-[#E5CCFF]'
                              }`}
                            >
                              {item.name}
                            </motion.span>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </nav>
                </div>

                {/* Auth */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 border-t border-gray-100"
                >
                  {isSignedIn ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F3E8FF]">
                      <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                          elements: {
                            avatarBox: 'w-10 h-10'
                          }
                        }}
                      />
                      <span className="text-sm font-medium text-[#9D4EDD]">
                        My Account
                      </span>
                    </div>
                  ) : (
                    <SignInButton mode="modal">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-full px-6 py-2 bg-[#9D4EDD] text-white rounded-xl font-medium transition-all duration-300 hover:bg-[#7B2CBF] shadow-lg"
                      >
                        Login
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
