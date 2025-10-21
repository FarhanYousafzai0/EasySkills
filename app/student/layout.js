'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarStudent from '@/components/User/SidebarStudent';
import NavbarStudent from '@/components/User/NavbarStudent';

export default function StudentLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (isLoaded) {
      console.log("🔍 Student Layout - Auth State:", { isSignedIn, user: user?.id });
      
      if (!isSignedIn) {
        console.log("❌ Not signed in, redirecting to home");
        router.push('/');
        return;
      }
      
      const role = user?.publicMetadata?.role || user?.metadata?.role;
      console.log("🎭 User role:", role);
      
      if (role === 'admin') {
        console.log("👑 Admin user in student area, redirecting to admin");
        router.push('/admin');
        return;
      }
      
      console.log("✅ Student user, allowing access");
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect
  }

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
