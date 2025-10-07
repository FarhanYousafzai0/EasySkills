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
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <div className='relative flex justify-between items-center h-[80px] mt-5'>
        <motion.nav
          initial={{ y: 0 }}
          animate={{ 
            y: isVisible ? 0 : -100,
            opacity: isAtTop ? 1 : 0.98
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`fixed top-0 left-0 right-0 z-50 `}
        >
          <div className="bg-white  mx-auto w-[95%] lg:w-[90%] mt-5 shadow rounded-xl border border-neutral-100">
            <div className="flex items-center justify-between h-[80px] px-6 lg:px-8">
              {/* Logo */}
              <Link href="/" className="flex items-center z-50">
                <motion.div 
                  transition={{ duration: 0.2 }}
                  className="text-2xl font-bold text-black"
                >
                  Logo
                </motion.div>
              </Link>

              {/* Desktop Navigation Items */}
              <div className="hidden md:flex items-center space-x-2">
                {NavItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <Link key={item.path} href={item.path}>
                      <motion.span
                      
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`block px-5 py-2 rounded-full text-lg font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-black text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                        }`}
                      >
                        {item.name}
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-7 py-2 cursor-pointer bg-black text-white rounded-full font-medium transition-all duration-300 hover:bg-gray-800 shadow-md hover:shadow-lg"
                      >
                        <span className="text-lg">Login</span>
                      </motion.button>
                    </SignInButton>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden z-50 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
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
              className="fixed top-3 rounded-md right-3 h-full w-[350px] bg-white shadow-2xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-black">Menu</h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={closeMobileMenu}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
                              className={`block px-5 py-3.5 rounded-xl text-base font-medium transition-all duration-300 ${
                                isActive
                                  ? 'bg-black text-white shadow-lg'
                                  : 'text-gray-700 hover:bg-gray-100 active:bg-gray-100'
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

                {/* Mobile Auth Section */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 border-t border-gray-100"
                >
                  {isSignedIn ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
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
                        className="w-full px-6 py-2 cursor-pointer bg-black text-white rounded-xl font-medium transition-all duration-300 hover:bg-gray-800 shadow-lg active:shadow-md"
                      >
                        <span className="text-lg">Login</span>
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