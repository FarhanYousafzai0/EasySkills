'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Users,
  DollarSign,
  Settings,
  MessageSquare,
  HelpCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const Sidebar = () => {
  const pathname = usePathname()

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Transactions', path: '/admin/transactions', icon: DollarSign },
  ]

  const tools = [
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Feedback', path: '/admin/feedback', icon: MessageSquare },
    { name: 'Help', path: '/admin/help', icon: HelpCircle },
  ]

  return (
    <div className="hidden  md:flex flex-col justify-between  border mt-5  bg-white shadow-lg h-[95vh] w-84 rounded-3xl p-6">
      {/* Logo Section */}
      <div>
        <div className="flex items-center gap-3 mb-10">
        <Link href="/" className="flex items-center z-50">
                
   
    <Image src="/Logo.svg" alt="logo" width={150} height={150} />
              </Link>
        </div>

        {/* Menu Items */}
        <nav className="space-y-3">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Menu</h3>
          {menu.map((item) => {
            const active = pathname === item.path
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200" />

        {/* Tools */}
        <nav className="space-y-3">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Tools</h3>
          {tools.map((item) => {
            const active = pathname === item.path
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Upgrade Card */}
      
    </div>
  )
}

export default Sidebar
