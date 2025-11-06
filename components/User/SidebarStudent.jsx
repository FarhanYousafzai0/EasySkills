'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  Video,
  MessageSquareWarning,
  HelpCircle,
  Settings,
  ChevronDown,
  X,
  UploadCloud,
  CheckCircle2,
  Package,
  BookOpen,
} from 'lucide-react';

export default function SidebarStudent({ isOpen = false, toggleSidebar = () => {} }) {
  const pathname = usePathname();

  /* ------------------------- NAVIGATION SETUP ------------------------- */
  const nav = useMemo(
    () => [
      { name: 'Dashboard', path: '/student', icon: LayoutDashboard },

      {
        name: 'My Tasks',
        base: '/student/task',
        icon: ClipboardList,
        children: [
          { name: 'All Tasks', path: '/student/task' },
          { name: 'Submit Task', path: '/student/task/submit' },
          { name: 'Submitted Tasks', path: '/student/task/submitted' },
        ],
      },

      {
        name: 'Report Issues',
        base: '/student/report',
        icon: MessageSquareWarning,
        children: [
          { name: 'Report Issue', path: '/student/report' },
          { name: 'All Issues', path: '/student/report/allreports' },
        ],
      },
      { name: 'Leaderboard', path: '/student/leaderboard', icon: BarChart2 },
      { name: 'Live Sessions', path: '/student/live-sessions', icon: Video },
      { name: 'Buy Tools', path: '/student/tools', icon: Package },
      { name: 'Courses', path: '/student/courses', icon: BookOpen },
    ],
    []
  );

 
  /* ------------------------- DROPDOWN STATE ------------------------- */
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    // auto-open dropdown for active route
    nav.forEach((item) => {
      if (item.children && pathname.startsWith(item.base)) {
        setOpenDropdown(item.name);
      }
    });
  }, [pathname, nav]);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const isActive = (path) => pathname === path;
  const isGroupActive = (base) => pathname.startsWith(base);

  /* ------------------------- STYLING ------------------------- */
  const itemBase =
    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200';
  const activeCls = 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md';
  const hoverCls = 'hover:bg-gray-100 text-gray-700';

  /* ------------------------- SIDEBAR BODY ------------------------- */
  const sidebarBody = (
    <div className="flex flex-col justify-between h-full overflow-hidden bg-white ml-4 shadow-xl w-72 md:w-80 rounded-3xl p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <Image src="/Logo.svg" alt="LMS Logo" width={140} height={36} priority />
        <button className="md:hidden" onClick={toggleSidebar}>
          <X size={22} className="text-gray-700" />
        </button>
      </div>

      {/* MAIN NAV */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
          Menu
        </h3>

        <nav className="space-y-2">
          {nav.map((item) => {
            const groupActive = isGroupActive(item.base);

            // DROPDOWN GROUP
            if (item.children) {
              const isOpen = openDropdown === item.name;

              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`${itemBase} w-full text-left ${
                      groupActive ? activeCls : hoverCls
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="flex-1">{item.name}</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-1 ml-3 pl-3 border-l border-gray-200 space-y-1"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            href={child.path}
                            onClick={toggleSidebar}
                            className="block"
                          >
                            <motion.div
                              whileTap={{ scale: 0.97 }}
                              className={`${itemBase} ${
                                isActive(child.path)
                                  ? activeCls
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {child.name === 'Submit Task' ? (
                                <UploadCloud size={16} className="text-[#7866FA]" />
                              ) : child.name.includes('Submitted') ? (
                                <CheckCircle2 size={16} className="text-green-500" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              )}
                              {child.name}
                            </motion.div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // SINGLE LINK
            return (
              <Link key={item.path} href={item.path} onClick={toggleSidebar}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className={`${itemBase} ${isActive(item.path) ? activeCls : hoverCls}`}
                >
                  <item.icon size={18} />
                  {item.name}
                </motion.div>
              </Link>
            );
          })}
        </nav>

      
       
       
      </div>

      {/* FOOTER */}
      <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
        © 2025 LMS Platform
      </div>
    </div>
  );

  /* ------------------------- WRAPPER ------------------------- */
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex mt-5 h-[95vh]">{sidebarBody}</div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
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
              className="fixed left-0 top-0 bottom-0 z-50"
            >
              {sidebarBody}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* 🧭 Optional CSS (global.css or Tailwind config)
   For smooth vertical scrollbars
   -------------------------------------------------
   .custom-scrollbar::-webkit-scrollbar {
     width: 6px;
   }
   .custom-scrollbar::-webkit-scrollbar-thumb {
     background-color: rgba(120, 102, 250, 0.3);
     border-radius: 10px;
   }
   .custom-scrollbar::-webkit-scrollbar-thumb:hover {
     background-color: rgba(120, 102, 250, 0.6);
   }
*/
