'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  ClipboardList,
  GraduationCap,
  Settings,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  X,
} from 'lucide-react';

/**
 * Props:
 *  - isOpen (mobile drawer): boolean
 *  - toggleSidebar: () => void
 * Desktop: render inside a sticky container from the layout (no overlay)
 * Mobile: wrapped by overlay in the layout and passed isOpen=true
 */
export default function Sidebar({ isOpen = false, toggleSidebar = () => {} }) {
  const pathname = usePathname();

  // ----- NAV DATA -----
  const nav = useMemo(
    () => [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Reports', path: '/admin/reports', icon: BarChart3 },

      {
        name: 'Students',
        base: '/admin/students',
        icon: Users,
        children: [
          { name: 'Add Student', path: '/admin/students/add' },
          { name: 'All Students', path: '/admin/students' },
          { name: 'Leaderboard', path: '/admin/students/leaderboard' },
        ],
      },

      // Batches does NOT have children, should NOT dropdown
      {
        name: 'Batches',
        path: '/admin/batches',
        icon: GraduationCap,
      },

      {
        name: 'Tasks & Live Sessions',
        base: '/admin/tasks',
        icon: ClipboardList,
        children: [
          { name: 'Add Task & Live Session', path: '/admin/tasks/add' },
          { name: 'All Tasks & Live Sessions', path: '/admin/tasks' },
          { name: 'Preview Tasks', path: '/admin/tasks/preview' }, // submissions view
        ],
      },
    ],
    []
  );

  // Which submenus are open
  const [open, setOpen] = useState({});

  // Auto-open the group that matches current path on mount/route change
  useEffect(() => {
    const next = {};
    nav.forEach((item) => {
      if (item.children && (pathname === item.base || pathname.startsWith(item.base + '/'))) {
        next[item.name] = true;
      }
    });
    setOpen((prev) => ({ ...prev, ...next }));
  }, [pathname, nav]);

  const isActive = (path) => pathname === path;
  const isGroupActive = (base) => pathname === base || pathname.startsWith(base + '/');

  const itemBaseCls =
    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200';
  const activeCls = 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md';
  const hoverCls = 'hover:bg-gray-100 text-gray-700';

  const sidebarBody = (
    <div className="flex flex-col justify-between h-full bg-white ml-4 shadow-xl w-72 md:w-80 rounded-3xl p-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image src="/Logo.svg" alt="logo" width={140} height={36} />
          </div>
          <button className="md:hidden" onClick={toggleSidebar} aria-label="Close sidebar">
            <X size={22} className="text-gray-700" />
          </button>
        </div>

        {/* MENU */}
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Menu</h3>
        <nav className="space-y-2">
          {nav.slice(0, 2).map((item) => (
            <Link key={item.path} href={item.path} onClick={toggleSidebar}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`${itemBaseCls} ${isActive(item.path) ? activeCls : hoverCls}`}
              >
                <item.icon size={18} />
                {item.name}
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* DIVIDER */}
        <div className="my-5 border-t border-gray-200" />

        {/* GROUPS & SINGLE ITEMS AFTER THE FIRST 2 */}
        <nav className="space-y-2">
          {/* Students (with children), Batches (no children), Tasks (with children) */}
          {nav.slice(2).map((item) => {
            // If has children: render group with dropdown
            if (item.children) {
              const groupOpen = !!open[item.name];
              const groupActive = isGroupActive(item.base);

              return (
                <div key={item.name}>
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
                  <AnimatePresence initial={false}>
                    {groupOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
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
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
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
            // No children (like Batches): render as a simple link
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

        {/* DIVIDER */}
        <div className="my-6 border-t border-gray-200" />

        {/* TOOLS */}
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">Tools</h3>
        <nav className="space-y-2">
          {[ 
            { name: 'Settings', path: '/admin/settings', icon: Settings },
            { name: 'Feedback', path: '/admin/feedback', icon: MessageSquare },
            { name: 'Help', path: '/admin/help', icon: HelpCircle },
          ].map((t) => (
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

      {/* FOOTER / CTA */}
      
    </div>
  );

  // Desktop: parent container should be sticky; here we only render the body.
  return (
    <>
      <div className="hidden md:flex mt-5 h-[95vh]">{sidebarBody}</div>
      {/* Mobile drawer (layout decides when to show) */}
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
