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
  MessageSquare,
  HelpCircle,
  Settings,
  ChevronDown,
  X,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

/**
 * 🎓 SidebarStudent
 * Full-featured responsive sidebar for Student Dashboard
 * Includes dropdowns, smooth animations, and mobile drawer behavior
 */
export default function SidebarStudent({ isOpen = false, toggleSidebar = () => {} }) {
  const pathname = usePathname();

  // 🧭 Navigation Links
  const nav = useMemo(
    () => [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },

      {
        name: 'My Tasks',
        base: '/student/tasks',
        icon: ClipboardList,
        children: [
          { name: 'All Tasks', path: '/student/tasks' },
          { name: 'Submit Task', path: '/student/tasks/submit' },
          { name: 'Submitted Tasks', path: '/student/tasks/submitted' },
        ],
      },

      { name: 'Live Sessions', path: '/student/live-sessions', icon: Video },
      { name: 'Leaderboard', path: '/student/leaderboard', icon: BarChart2 },
      { name: 'Report Issue', path: '/student/report', icon: MessageSquare },
    ],
    []
  );

  // ⚙️ Tools Section
  const tools = [
    { name: 'Settings', path: '/student/settings', icon: Settings },
    { name: 'Help', path: '/student/help', icon: HelpCircle },
  ];

  // 🔽 Dropdown Open/Close Logic
  const [open, setOpen] = useState({});
  useEffect(() => {
    const next = {};
    nav.forEach((item) => {
      if (item.children && (pathname === item.base || pathname.startsWith(item.base + '/'))) {
        next[item.name] = true;
      }
    });
    setOpen((prev) => ({ ...prev, ...next }));
  }, [pathname, nav]);

  // 🔍 Helpers for Active Routes
  const isActive = (path) => pathname === path;
  const isGroupActive = (base) => pathname === base || pathname.startsWith(base + '/');

  // 🎨 Base Styles
  const itemBaseCls =
    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200';
  const activeCls = 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md';
  const hoverCls = 'hover:bg-gray-100 text-gray-700';

  // 🌈 Sidebar Content
  const sidebarBody = (
    <div className="flex flex-col justify-between h-full bg-white ml-4 shadow-xl w-72 md:w-80 rounded-3xl p-6">
      {/* ─────── Header ─────── */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <Image src="/Logo.svg" alt="LMS Logo" width={140} height={36} priority />
          <button className="md:hidden" onClick={toggleSidebar}>
            <X size={22} className="text-gray-700" />
          </button>
        </div>

        {/* ─────── Menu Section ─────── */}
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
          Menu
        </h3>

        <nav className="space-y-2">
          {nav.map((item) => {
            // Dropdown Groups
            if (item.children) {
              const groupOpen = !!open[item.name];
              const groupActive = isGroupActive(item.base);

              return (
                <div key={item.name}>
                  {/* Group Button */}
                  <button
                    onClick={() => setOpen((s) => ({ ...s, [item.name]: !groupOpen }))}
                    className={`${itemBaseCls} w-full text-left ${
                      groupActive ? activeCls : hoverCls
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="flex-1">{item.name}</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${groupOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Children */}
                  <AnimatePresence initial={false}>
                    {groupOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-1 ml-2 pl-3 border-l border-gray-200 space-y-1 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <Link key={child.path} href={child.path} onClick={toggleSidebar}>
                            <motion.div
                              whileTap={{ scale: 0.98 }}
                              className={`${itemBaseCls} ${
                                isActive(child.path)
                                  ? activeCls
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {/* Contextual Icons for Tasks */}
                              {child.name === 'Submit Task' ? (
                                <UploadCloud size={16} className="text-[#7866FA]" />
                              ) : child.name === 'Submitted Tasks' ? (
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

            // Single Item
            return (
              <Link key={item.path} href={item.path} onClick={toggleSidebar}>
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className={`${itemBaseCls} ${isActive(item.path) ? activeCls : hoverCls}`}
                >
                  <item.icon size={18} />
                  {item.name}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200" />

        {/* ─────── Tools Section ─────── */}
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
          Tools
        </h3>
        <nav className="space-y-2">
          {tools.map((t) => (
            <Link key={t.path} href={t.path} onClick={toggleSidebar}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`${itemBaseCls} ${isActive(t.path) ? activeCls : hoverCls}`}
              >
                <t.icon size={18} />
                {t.name}
              </motion.div>
            </Link>
          ))}
        </nav>
      </div>

      {/* ─────── Footer ─────── */}
      <div className="pt-6 border-t border-gray-200 text-xs text-gray-500">
        © 2025 LMS Platform
      </div>
    </div>
  );

  // 🌍 Sidebar Wrapper (Desktop + Mobile)
  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:flex mt-5 h-[95vh]">{sidebarBody}</div>

      {/* Mobile Drawer Version */}
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
