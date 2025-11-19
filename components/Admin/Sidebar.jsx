"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  Wrench,
  Video,
} from "lucide-react";

export default function Sidebar({ isOpen = false, toggleSidebar = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();

  /* ---------------------- NAV DATA ---------------------- */
  const nav = useMemo(
    () => [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { name: "Reports", path: "/admin/reports", icon: BarChart3 },

      {
        name: "Students",
        base: "/admin/students",
        icon: Users,
        children: [
          { name: "Add Student", path: "/admin/students/add" },
          { name: "All Students", path: "/admin/students" },
          { name: "Leaderboard", path: "/admin/students/leaderboard" },
        ],
      },

      { name: "Batches", path: "/admin/batches", icon: GraduationCap },

      {
        name: "Tasks & Live Sessions",
        base: "/admin/tasks",
        icon: ClipboardList,
        children: [
          { name: "Add Task & Live Session", path: "/admin/tasks/add" },
          { name: "All Tasks & Live Sessions", path: "/admin/tasks" },
          { name: "Preview Tasks", path: "/admin/tasks/preview" },
        ],
      },

      // 🧰 Tools Section
      {
        name: "Tools",
        base: "/admin/tools",
        icon: Wrench,
        children: [
          { name: "Add Tool", path: "/admin/tools/add" },
          { name: "All Tools", path: "/admin/tools" },
         
        ],
      },

      // 🎓 Courses Section
      {
        name: "Courses",
        base: "/admin/courses",
        icon: Video,
        children: [
          { name: "Add Course", path: "/admin/courses/add" },
          { name: "All Courses", path: "/admin/courses" },
         
        ],
      },
    ],
    []
  );

  const [open, setOpen] = useState({});

  useEffect(() => {
    const next = {};
    nav.forEach((item) => {
      if (item.children && (pathname === item.base || pathname.startsWith(item.base + "/"))) {
        next[item.name] = true;
      }
    });
    setOpen((prev) => ({ ...prev, ...next }));
  }, [pathname, nav]);

  const handleDropdownToggle = (name) => {
    setOpen((prev) => {
      const nextState = {};
      Object.keys(prev).forEach((key) => (nextState[key] = false));
      nextState[name] = !prev[name];
      return nextState;
    });
  };

  const isActive = (path) => pathname === path;
  const isGroupActive = (base) => pathname === base || pathname.startsWith(base + "/");

  const baseCls =
    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200";
  const activeCls = "bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md";
  const hoverCls = "hover:bg-gray-100 text-gray-700";

  /* ---------------------- SIDEBAR BODY ---------------------- */
  const sidebarBody = (
    <div className="flex flex-col justify-between h-full bg-white shadow-xl w-72 md:w-80 rounded-3xl p-6 overflow-y-hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => {
              router.push("/");
              toggleSidebar();
            }}
          >
            <Image src="/Logo.svg" alt="Logo" width={140} height={36} priority />
          </div>
          </Link>
          <button
            className="md:hidden hover:bg-gray-100 rounded-lg p-1.5"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* MAIN MENU */}
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
          Menu
        </h3>
        <nav className="space-y-2">
          {nav.slice(0, 2).map((item) => (
            <Link key={item.path} href={item.path} onClick={toggleSidebar}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`${baseCls} ${isActive(item.path) ? activeCls : hoverCls}`}
              >
                <item.icon size={18} />
                {item.name}
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* DIVIDER */}
        <div className="my-5 border-t border-gray-200" />

        {/* GROUPS (Students, Tasks, Tools, etc.) */}
        <nav className="space-y-2 overflow-y-auto max-h-[60vh] pr-1">
          {nav.slice(2).map((item) => {
            if (item.children) {
              const groupOpen = !!open[item.name];
              const groupActive = isGroupActive(item.base);
              return (
                <div key={item.name}>
                  <button
                    onClick={() => handleDropdownToggle(item.name)}
                    className={`${baseCls} w-full text-left ${
                      groupActive ? activeCls : hoverCls
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="flex-1">{item.name}</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${groupOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {groupOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-1 ml-2 pl-3 border-l border-gray-200 space-y-1 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <Link key={child.path} href={child.path} onClick={toggleSidebar}>
                            <motion.div
                              whileTap={{ scale: 0.98 }}
                              className={`${baseCls} ${
                                isActive(child.path)
                                  ? activeCls
                                  : "text-gray-600 hover:bg-gray-100"
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

            // Simple item
            return (
              <Link key={item.path} href={item.path} onClick={toggleSidebar}>
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className={`${baseCls} ${isActive(item.path) ? activeCls : hoverCls}`}
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
      <div className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} EasySkills Admin
      </div>
    </div>
  );

  /* ---------------------- RENDER ---------------------- */
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex mt-5 h-[95vh]">{sidebarBody}</div>

      {/* Mobile Drawer */}
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
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 220 }}
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
