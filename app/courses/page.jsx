"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Film, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Nav from "@/components/Nav";

export default function StudentCoursesPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async (clerkId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/courses?clerkId=${clerkId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data || data.courses || []);
      } else {
        toast.error(data.message || "Error fetching courses");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error fetching courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      toast.error("You must be signed in to view your courses.");
      router.push("/sign-in");
      return;
    }
    fetchCourses(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  if (!isLoaded || (loading && courses.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <Loader2 size={32} className="animate-spin text-[#7866FA]" />
      </div>
    );
  }

  return (
    
   <>
   <Nav/>
   <div className="min-h-screen mt-20  px-4 py-6 md:px-8 md:py-10 text-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#9380FD] to-[#7866FA] shadow-[0_18px_45px_rgba(88,80,255,0.55)]">
              <Film className="text-white" size={22} />
            </div>
            <div>
              
              <h1 className="text-2xl md:text-3xl font-semibold text-black">
                My Courses
              </h1>
              <p className="text-[12px] md:text-sm text-slate-400 mt-1">
                Continue exactly where you left off, across all your courses.
              </p>
            </div>
          </div>

          {courses.length > 0 && (
            <div className="hidden md:flex flex-col items-end text-right text-[11px] text-slate-400">
              <span className="text-slate-300 font-medium">
                {courses.length} active course
                {courses.length > 1 ? "s" : ""}
              </span>
              <span>Progress is saved automatically.</span>
            </div>
          )}
        </div>

        {/* Content */}
        {loading && courses.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-[#7866FA]" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="p-4 rounded-3xl bg-slate-900/70 border border-white/10 mb-3">
              <Film size={32} className="text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-200 mb-1">
              No courses assigned yet
            </p>
            <p className="text-[12px] text-slate-500 max-w-sm text-center">
              Once you’re enrolled in a course, it will appear here with your
              progress and a quick continue button.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => {
              const progress =
                typeof course.progress === "number"
                  ? course.progress
                  : course.progressPercent || 0;

              return (
                <motion.div
                  key={course._id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="bg-slate-950/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col"
                >
                  {/* Thumbnail */}
                  {course.thumbnailUrl && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      {course.accessTill && (
                        <div className="absolute top-3 left-3 px-3 py-1 text-[10px] font-semibold rounded-full bg-black/65 text-white border border-white/20">
                          Access till{" "}
                          {new Date(
                            course.accessTill
                          ).toLocaleDateString()}
                        </div>
                      )}
                      {course.durationLabel && (
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 text-[10px] font-medium rounded-full bg-slate-950/80 text-slate-100 border border-white/20">
                          {course.durationLabel}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-slate-50 text-sm mb-1 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-[12px] text-slate-400 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-semibold text-slate-200">
                          {Math.round(progress)}% COMPLETE
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {course.totalVideos || 0} videos
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#9380FD] to-[#7866FA]"
                          style={{
                            width: `${Math.min(
                              Math.max(progress, 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Button */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        router.push(`/courses/${course._id}`)
                      }
                      className="mt-auto w-full rounded-xl cursor-pointer bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white text-[13px] font-semibold py-2.5 shadow-md hover:shadow-lg"
                    >
                      {progress > 0 ? "Continue Course" : "Start Course"}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
   </>
  );
}
