"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminAllCoursesPage() {
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    const res = await fetch("/api/admin/course");
    const data = await res.json();
    if (data.success) setCourses(data.data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Courses</h1>
        <a
          href="/dashboard/courses/add"
          className="px-4 py-2 bg-[#7866FA] text-white rounded-lg shadow hover:opacity-90"
        >
          + Add Course
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <motion.div
            key={c._id}
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-white border rounded-xl shadow"
          >
            {c.thumbnailUrl && (
              <img
                src={c.thumbnailUrl}
                className="rounded-lg w-full h-40 object-cover mb-3"
              />
            )}

            <h2 className="font-bold text-lg">{c.title}</h2>
            <p className="text-sm text-gray-600">{c.category}</p>

            {/* 🔥 Sections + Videos Count */}
            <div className="flex items-center gap-4 text-sm text-gray-700 mt-2">
              <span>  Sections: {c.totalSections}</span>
              <span>  Videos: {c.totalVideos}</span>
            </div>

            <a
              href={`/admin/courses/${c._id}`}
              className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-lg"
            >
              Manage
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
