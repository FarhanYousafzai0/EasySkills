"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import { toast } from "sonner";
import Nav from "@/components/Nav";

/* ─────────────────────────────────────────────── */
/*  DYNAMIC SKELETON CARD (BIGGER VERSION)         */
/* ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-[#e9e6ff] shadow-[0_22px_70px_rgba(147,128,253,0.15)] p-5 animate-pulse">

      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-[#f1edff]">

        {/* Access Till Badge */}
        <div className="absolute top-4 left-4 h-5 w-28 bg-[#ece8ff] rounded-full" />

        {/* Duration Badge */}
        <div className="absolute bottom-4 right-4 h-5 w-20 bg-[#ece8ff] rounded-full" />
      </div>

      <div className="mt-5 space-y-4">

        {/* Title */}
        <div className="h-5 w-4/5 bg-[#ece8ff] rounded" />

        {/* Description lines */}
        <div className="h-4 w-full bg-[#ece8ff] rounded" />
        <div className="h-4 w-5/6 bg-[#ece8ff] rounded" />

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2.5 w-full bg-[#e6e0ff]/50 rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-gradient-to-r from-[#9380FD]/20 to-[#7866FA]/20" />
          </div>
        </div>

        {/* Button */}
        <div className="h-12 w-full bg-gradient-to-r from-[#9380FD]/20 to-[#7866FA]/20 rounded-xl" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  SKELETON PAGE WITH DYNAMIC COUNT               */
/* ─────────────────────────────────────────────── */
function StudentCoursesSkeleton({ count }) {
  const skeletons = Array(count).fill(0);

  return (
    <>
      <Nav />
      <div className="min-h-screen mt-20 px-4 py-6 md:px-8 md:py-10 bg-white">
        <div className="max-w-6xl mx-auto">

          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-10 animate-pulse">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#9380FD]/25 to-[#7866FA]/25 h-12 w-12" />
            <div className="space-y-3">
              <div className="h-5 w-48 bg-[#ece8ff] rounded" />
              <div className="h-4 w-72 bg-[#ece8ff] rounded" />
            </div>
          </div>

          {/* Skeleton grid */}
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {skeletons.map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────── */
/*  MAIN PAGE                                      */
/* ─────────────────────────────────────────────── */
export default function StudentCoursesPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ─────────────────── Fetch Courses ─────────────────── */
  const fetchCourses = async (clerkId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/courses?clerkId=${clerkId}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success) setCourses(data.data || data.courses || []);
      else toast.error(data.message || "Error fetching courses");
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
  }, [isLoaded, user?.id, router]);

  /* ─────────────────── Show Skeleton ─────────────────── */

  if (!isLoaded || loading) {
    return (
      <StudentCoursesSkeleton
        count={courses.length === 0 ? 1 : courses.length} // ⭐ EXACT COUNT YOU WANTED
      />
    );
  }

  /* ─────────────────── REAL PAGE ─────────────────── */
  return (
    <>
      <Nav />

      <div className="min-h-screen mt-20 px-4 py-6 md:px-8 md:py-10">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#9380FD] to-[#7866FA] shadow-[0_18px_45px_rgba(88,80,255,0.55)]">
                <Film className="text-white" size={26} />
              </div>

              <div>
                <h1 className="text-3xl font-semibold text-black">
                  My Courses
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Continue exactly where you left off.
                </p>
              </div>
            </div>

            {courses.length > 0 && (
              <div className="hidden md:flex flex-col items-end text-right text-xs text-slate-500">
                <span className="text-slate-700 font-medium text-sm">
                  {courses.length} active course{courses.length > 1 ? "s" : ""}
                </span>
                <span>Progress updates automatically.</span>
              </div>
            )}
          </div>

          {/* No Courses */}
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="p-5 rounded-3xl bg-white/80 border border-[#e9e6ff] shadow">
                <Film size={40} className="text-[#9380FD]" />
              </div>
              <p className="text-lg font-medium text-black mt-4">
                No courses assigned yet.
              </p>
              <p className="text-sm text-slate-500 max-w-sm text-center">
                Once you're enrolled, your courses will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => {
                const progress =
                  typeof course.progress === "number"
                    ? course.progress
                    : course.progressPercent || 0;

                return (
                  <motion.div
                    key={course._id}
                    whileHover={{ y: -5, scale: 1.01 }}
                    className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#e9e6ff] shadow-[0_18px_45px_rgba(147,128,253,0.25)] overflow-hidden flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 w-full overflow-hidden p-4">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-xl"
                      />

                      {/* Access Till */}
                      {course.accessTill && (
                        <div className="absolute top-4 left-4 px-3 py-1 text-[11px] font-semibold rounded-full bg-white/80 backdrop-blur border border-[#e9e6ff]">
                          Access till {new Date(course.accessTill).toLocaleDateString()}
                        </div>
                      )}

                      {/* Duration Label */}
                      {course.durationLabel && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 text-[11px] font-semibold rounded-full bg-white/80 backdrop-blur border border-[#e9e6ff]">
                          {course.durationLabel}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-semibold text-slate-800 text-base mb-2 line-clamp-2 leading-snug">
                        {course.title}
                      </h3>

                      <p className="text-sm text-slate-500 mb-5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-slate-700">
                            {Math.round(progress)}% COMPLETE
                          </span>
                          <span className="text-xs text-slate-500">
                            {course.totalVideos || 0} videos
                          </span>
                        </div>

                        <div className="w-full h-2.5 rounded-full bg-[#e8e4ff] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#9380FD] to-[#7866FA]"
                            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Button */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push(`/courses/${course._id}`)}
                        className="mt-auto w-full rounded-xl cursor-pointer bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white text-sm font-semibold py-3 shadow-md hover:shadow-lg"
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
