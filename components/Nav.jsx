'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { NavItems } from '@/lib/data'



const Nav = () => {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Check if at top
      setIsAtTop(currentScrollY < 10)

      // Hide/show logic
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

  return (
  <div className='relative flex justify-between items-center  h-[80px] mt-5'>

<div
      className={`fixed top-0 left-0  right-0 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } `}
      style={{
        opacity: isAtTop ? 1 : 0.98,
      }}
    >
      <div className="bg-white mx-auto shadow-md w-[95%] lg:w-[90%] mt-5 rounded-md">
        <div className="flex items-center justify-between h-[80px] px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-black">
              Logo
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {NavItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                 
                >
                   <span   className={`px-4 py-2 rounded-md text-lg font-medium transition-all duration-200 ${
                    isActive
                      ? '  bg-black text-white'
                      : 'text-gray-700 hover:text-black hover:opacity-80'
                  }`}>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center">
            {isSignedIn ? (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <button className="px-8 py-2 bg-black text-white rounded-md  font-medium transition-all duration-200 hover:opacity-90 hover:scale-105">
                  <span className='text-lg'>Login</span>
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden px-6 pb-4">
          <div className="flex flex-col space-y-2">
            {NavItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                
                >
                    <span   className={`px-4 py-2 rounded-md  font-medium text-lg transition-all duration-200 ${
                    isActive
                      ? ' bg-black text-white'
                      : 'text-gray-700 hover:text-black hover:opacity-80'
                  }`}>{item.name}</span>
                  
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Nav