"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Trash2, Eye, BookOpen, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AdminAllCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  const fetchCourses = async () => {
    const res = await fetch("/api/admin/course");
    const data = await res.json();
    if (data.success) setCourses(data.data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ---------------- DELETE COURSE ---------------- */
  const handleDeleteCourse = async (id) => {
   

    const res = await fetch(`/api/admin/course/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      toast.success("Course deleted successfully");
      fetchCourses();
    } else {
      toast.error(data.message || "Delete failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">All Courses</h1>
        <a
          href="/admin/courses/add"
          className="px-4 py-2 bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white rounded-lg shadow hover:opacity-90"
        >
          + Add Course
        </a>
      </div>

      {/* COURSES GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <motion.div
            key={c._id}
            whileHover={{ scale: 1.02 }}
            className="relative bg-white rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* MENU BUTTON */}
            <div ref={menuRef} className="absolute top-4 right-4 z-30">
              <button
                onClick={() =>
                  setOpenMenu(openMenu === c._id ? null : c._id)
                }
                className="p-2 bg-white/90 cursor-pointer backdrop-blur-md rounded-xl shadow hover:shadow-md transition-all"
              >
                <MoreVertical size={18} className="text-slate-600" />
              </button>

              <AnimatePresence>
                {openMenu === c._id && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200"
                  >
                    {/* PREVIEW */}
                    <a
                      href={`/courses/${c._id}`}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Eye size={16} /> Preview
                    </a>

                    {/* DELETE ONLY */}
                    <button
                      onClick={() => handleDeleteCourse(c._id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* THUMBNAIL WITH MARGINS */}
            <div className="relative h-44 overflow-hidden px-4 pt-4">
              <div className="w-full h-full rounded-xl overflow-hidden shadow-sm">
                {c.thumbnailUrl ? (
                  <img
                    src={c.thumbnailUrl}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-[#9380FD] to-[#7866FA] flex items-center justify-center">
                    <BookOpen size={48} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-bold text-xl text-slate-800 mb-2 line-clamp-2">
                {c.title}
              </h3>

              {c.description && (
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                  {c.description}
                </p>
              )}

              {/* STATS */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 bg-slate-100 rounded-xl">
                  <BookOpen size={16} className="mx-auto text-[#7866FA] mb-1" />
                  <div className="text-slate-800 font-semibold">
                    {c.totalSections || 0}
                  </div>
                  <div className="text-slate-400 text-xs">Sections</div>
                </div>

                <div className="text-center p-2 bg-slate-100 rounded-xl">
                  <Clock size={16} className="mx-auto text-[#7866FA] mb-1" />
                  <div className="text-slate-800 font-semibold">
                    {c.totalVideos || 0}
                  </div>
                  <div className="text-slate-400 text-xs">Videos</div>
                </div>
              </div>

              {/* MANAGE BUTTON */}
              <a
                href={`/admin/courses/${c._id}`}
                className="w-full mt-auto text-center px-4 py-3 bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white rounded-xl font-semibold shadow hover:shadow-lg transition-all cursor-pointer"
              >
                Manage Course
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
