"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Film, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/courses", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses || data.data || []);
      } else toast.error(data.message || "Error fetching courses");
    } catch {
      toast.error("Server error fetching courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-[#9380FD] to-[#7866FA] rounded-xl shadow-lg">
            <Film className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Courses
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Continue learning exactly where you left off.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-[#7866FA]" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Film size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium mb-1">
              No courses assigned yet
            </p>
            <p className="text-gray-400 text-sm">
              Once you’re enrolled in a course, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const progress = course.progressPercent || course.progress || 0;
              return (
                <motion.div
                  key={course._id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                >
                  {course.thumbnailUrl && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      {course.accessTill && (
                        <div className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold rounded-full bg-black/65 text-white">
                          Access till{" "}
                          {new Date(course.accessTill).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-semibold text-gray-700">
                          {progress}% COMPLETE
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {course.totalVideos || 0} videos
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#9380FD] to-[#7866FA]"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        router.push(`/student/courses/${course._id}`)
                      }
                      className="mt-auto w-full rounded-xl cursor-pointer bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white text-sm font-semibold py-2.5 shadow-sm hover:shadow-md"
                    >
                      {progress > 0 ? "Continue" : "Start Course"}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
