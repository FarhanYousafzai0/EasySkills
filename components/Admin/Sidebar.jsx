'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  ClipboardList,
  Settings,
  MessageSquare,
  HelpCircle,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Students', path: '/admin/users', icon: Users },
    { name: 'Add Tasks', path: '/admin/tasks', icon: ClipboardList },
  ];

  const tools = [
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Feedback', path: '/admin/feedback', icon: MessageSquare },
    { name: 'Help', path: '/admin/help', icon: HelpCircle },
  ];

  const sidebarContent = (
<div className="flex flex-col justify-between h-full bg-white shadow-xl w-72 md:w-80 rounded-r-3xl p-6 sticky top-0">
{/* Header */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <Image src="/Logo.svg" alt="logo" width={140} height={140} />
          <button className="md:hidden" onClick={toggleSidebar}>
            <X size={22} className="text-gray-700" />
          </button>
        </div>

        {/* Menu */}
        <nav className="space-y-3">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Menu</h3>
          {menu.map((item) => {
            const active = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  onClick={toggleSidebar}
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
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200" />

        {/* Tools */}
        <nav className="space-y-3">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Tools</h3>
          {tools.map((item) => {
            const active = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  onClick={toggleSidebar}
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
            );
          })}
        </nav>
      </div>

      {/* Footer / Upgrade */}
      <div className="bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white rounded-xl p-4 text-center cursor-pointer hover:opacity-90 transition">
        <h4 className="text-sm font-semibold">Upgrade to Pro</h4>
        <p className="text-xs text-white/80">Unlock advanced analytics</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex mt-5 h-[95vh]">{sidebarContent}</div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
