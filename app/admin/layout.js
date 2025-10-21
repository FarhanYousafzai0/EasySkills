'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Admin/Sidebar';
import Navbar from '@/components/Admin/Nav';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/');
        return;
      }
      
      const role = user?.publicMetadata?.role || user?.metadata?.role;
      if (role !== 'admin') {
        router.push('/student');
        return;
      }
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

  const role = user?.publicMetadata?.role || user?.metadata?.role;
  if (role !== 'admin') {
    return null; // Will redirect
  }

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* ✅ Sticky Sidebar (Desktop Only) */}
      <div className="hidden md:block h-full sticky top-0">
        <Sidebar />
      </div>

      {/* ✅ Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={toggleSidebar}
          ></div>

          {/* Drawer Sidebar */}
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl p-6 animate-slideIn rounded-r-2xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* ✅ Main Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto bg-gray-50 px-4 md:px-6">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 pb-10">{children}</main>
      </div>
    </div>
  );
}
