'use client';

import React, { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import SidebarStudent from '@/components/User/SidebarStudent';
import NavbarStudent from '@/components/User/NavbarStudent';

export default function StudentLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50">
      {/* ✅ Sidebar (Desktop) */}
      <div className="hidden md:block h-full sticky top-0">
        <SidebarStudent />
      </div>

      {/* ✅ Mobile Sidebar (Animated Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl p-6 rounded-r-2xl z-50"
            >
              <SidebarStudent toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ Main Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto px-4 md:px-6">
        <NavbarStudent toggleSidebar={toggleSidebar} />
        <main className="flex-1 pb-10">{children}</main>
      </div>
    </div>
  );
}
