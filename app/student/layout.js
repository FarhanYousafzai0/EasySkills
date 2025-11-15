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

  const [access, setAccess] = useState({
    allowAccess: true,
    lockReason: null,
    mentorshipDaysLeft: null,
  });

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  /* ----------------------- AUTH + MENTORSHIP CHECK ----------------------- */
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/');
      return;
    }

    const role = user?.publicMetadata?.role;
    if (role === 'admin') {
      router.push('/admin');
      return;
    }

    /* ---- Get Mentorship Info From Clerk Metadata ---- */
    const mentorshipEnd = user?.publicMetadata?.mentorshipEnd;
    const mentorshipStart = user?.publicMetadata?.mentorshipStart;

    if (mentorshipEnd) {
      const end = new Date(mentorshipEnd);
      const now = new Date();

      const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 0) {
        setAccess({
          allowAccess: false,
          lockReason: "MENTORSHIP_EXPIRED",
          mentorshipDaysLeft: 0,
        });
      } else {
        setAccess({
          allowAccess: true,
          lockReason: null,
          mentorshipDaysLeft: daysLeft,
        });
      }
    }
  }, [isLoaded, isSignedIn, user, router]);


  /* ----------------------- LOADING SCREEN ----------------------- */
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

  if (!isSignedIn) return null;

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50">
      {/* ---------------------- DESKTOP SIDEBAR ---------------------- */}
      <div className="hidden md:block h-full sticky top-0">
        <SidebarStudent access={access} />
      </div>

      {/* ---------------------- MOBILE SIDEBAR ---------------------- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl p-6 rounded-r-2xl z-50"
            >
              <SidebarStudent
                toggleSidebar={toggleSidebar}
                isOpen={isSidebarOpen}
                access={access}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---------------------- PAGE CONTENT ---------------------- */}
      <div className="flex flex-col flex-1 overflow-y-auto px-4 md:px-6">
        <NavbarStudent toggleSidebar={toggleSidebar} />

        {/* 🔒 If mentorship expired → show global lock message */}
        {!access.allowAccess ? (
          <div className="mt-6 p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            <h2 className="text-xl font-semibold">Your Mentorship Has Ended</h2>
            <p className="text-sm mt-2">
              Please contact the admin to renew your plan and regain full access.
            </p>
          </div>
        ) : (
          <main className="flex-1 pb-10">{children}</main>
        )}
      </div>
    </div>
  );
}
