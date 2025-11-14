"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowLeft, PlayCircle, CheckCircle2, Loader2, Video } from "lucide-react";
import { toast } from "sonner";

export default function StudentCoursePlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [progress, setProgress] = useState({
    percentage: 0,
    completedVideos: [],
    lastWatchedVideo: "",
  });
  const [completedMap, setCompletedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);

  const buildCompletedMap = (completedVideos = []) => {
    const map = {};
    for (const vid of completedVideos) {
      map[String(vid)] = true;
    }
    return map;
  };

  const pickInitialVideo = (sectionsArr, currentVideoId) => {
    if (!sectionsArr?.length) return null;

    if (currentVideoId) {
      for (const sec of sectionsArr) {
        for (const item of sec.items || []) {
          if (String(item._id) === String(currentVideoId)) {
            return item;
          }
        }
      }
    }

    for (const sec of sectionsArr) {
      if (sec.items?.length) {
        return sec.items[0];
      }
    }

    return null;
  };

  const fetchCourseData = async (clerkId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/courses/${id}?clerkId=${clerkId}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Error loading course");
        setLoading(false);
        return;
      }

      const payload = json.data || json;
      const courseData = payload.course || payload.data?.course || {};
      const sectionsData = payload.sections || courseData.sections || [];
      const progressData =
        payload.progress || payload.data?.progress || {
          percentage: 0,
          completedVideos: [],
          lastWatchedVideo: "",
        };

      const currentVideoId =
        payload.currentVideoId || progressData.lastWatchedVideo || "";

      const completedVideos = progressData.completedVideos || [];
      const map = buildCompletedMap(completedVideos);

      const initialVideo = pickInitialVideo(sectionsData, currentVideoId);

      setCourse(courseData);
      setSections(sectionsData);
      setProgress(progressData);
      setCompletedMap(map);
      setCurrentVideo(initialVideo);
    } catch (err) {
      console.error(err);
      toast.error("Server error loading course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    if (!isLoaded) return;

    if (!user) {
      toast.error("You must be signed in to view this course.");
      router.push("/sign-in");
      return;
    }

    fetchCourseData(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isLoaded, user?.id]);

  const saveProgress = async (video, completedFlag) => {
    if (!user || !video?._id) return;
    setSavingProgress(true);

    try {
      const res = await fetch("/api/student/courses/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          courseId: id,
          videoId: String(video._id),
          completed: completedFlag,
          lastWatchedVideo: String(video._id),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Error updating progress");
        setSavingProgress(false);
        return;
      }

      const updated = data.data;
      const map = buildCompletedMap(updated.completedVideos || []);

      setProgress({
        percentage: updated.percentage || 0,
        completedVideos: updated.completedVideos || [],
        lastWatchedVideo: updated.lastWatchedVideo || "",
      });
      setCompletedMap(map);
    } catch (err) {
      console.error(err);
      toast.error("Server error updating progress");
    } finally {
      setSavingProgress(false);
    }
  };

  const markCompleted = async (video) => {
    await saveProgress(video, true);
    toast.success("Video marked as completed");
  };

  const handleVideoEnd = () => {
    if (currentVideo) {
      markCompleted(currentVideo);
    }
  };

  const handleVideoSelect = async (video) => {
    setCurrentVideo(video);
    await saveProgress(video, !!completedMap[String(video._id)]);
  };

  /* ─────────────────────── Skeleton Loader ─────────────────────── */

  if (!isLoaded || (loading && !course)) {
    return (
      <div className="min-h-screen bg-white px-4 py-6 md:px-8 md:py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)] gap-6 animate-pulse">
          {/* LEFT: Playlist Skeleton */}
          <div className="backdrop-blur-xl rounded-2xl border border-[#e9e6ff] bg-white/60 shadow-[0_18px_60px_rgba(147,128,253,0.15)] flex flex-col">
            {/* Top bar */}
            <div className="px-4 pt-4 pb-3 border-b border-[#e9e6ff] flex items-center justify-between">
              <div className="h-4 w-32 rounded-full bg-[#9380FD]/20" />
              <div className="h-3 w-16 rounded-full bg-[#7866FA]/15" />
            </div>

            {/* Course header */}
            <div className="px-4 py-3 border-b border-[#e9e6ff] flex gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#9380FD]/25" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-[#9380FD]/20" />
                <div className="h-3 w-40 rounded bg-[#7866FA]/15" />
                <div className="h-3 w-28 rounded bg-[#9380FD]/15" />
              </div>
            </div>

            {/* Sections skeleton */}
            <div className="flex-1 overflow-hidden px-3 py-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#e9e6ff] bg-white/70 overflow-hidden"
                >
                  <div className="px-3 py-2.5 border-b border-[#e9e6ff] flex items-center justify-between">
                    <div className="h-3 w-32 rounded bg-[#9380FD]/20" />
                    <div className="h-3 w-10 rounded bg-[#7866FA]/15" />
                  </div>
                  <div className="px-3 py-3 space-y-2">
                    <div className="h-3 w-40 rounded bg-[#9380FD]/15" />
                    <div className="h-3 w-28 rounded bg-[#7866FA]/15" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Player Skeleton */}
          <div className="backdrop-blur-xl rounded-2xl border border-[#e9e6ff] bg-white/60 p-4 md:p-6 shadow-[0_22px_70px_rgba(147,128,253,0.20)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-[#9380FD]/20" />
                <div className="h-4 w-64 rounded bg-[#7866FA]/15" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-3 w-28 rounded bg-[#9380FD]/20 ml-auto" />
                <div className="h-3 w-40 rounded bg-[#7866FA]/15 ml-auto" />
              </div>
            </div>

            {/* Video skeleton */}
            <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-[#9380FD]/25 via-[#7866FA]/25 to-[#9E8CFF]/25 border border-[#e9e6ff] mb-5 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#9380FD]/60 border-t-transparent flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-[#4B3ABF] animate-spin" />
              </div>
            </div>

            {/* Text skeleton */}
            <div className="space-y-3">
              <div className="h-3 w-64 rounded bg-[#9380FD]/15" />
              <div className="h-3 w-80 rounded bg-[#7866FA]/15" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-slate-700">
        Failed to load course.
      </div>
    );
  }

  const totalVideos =
    course.totalVideos ||
    sections.reduce((acc, s) => acc + (s.items?.length || 0), 0);

  /* ─────────────────────── Main UI ─────────────────────── */

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        
        {/* Top Navigation Bar */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#e9e6ff] rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
          <button
            onClick={() => router.push("/courses")}
            className="inline-flex items-center gap-1 text-[12px] text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} /> Back to courses
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-3 py-1 rounded-full bg-gradient-to-r from-[#9E8CFF]/10 to-[#7866FA]/10 border border-[#9E8CFF]/40 text-[#4B3ABF]">
              {sections.length} sections
            </span>
            <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              {totalVideos} videos
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)] gap-4 md:gap-6">
          
          {/* LEFT – Playlist Sidebar */}
          <aside className="bg-white border border-[#e9e6ff] rounded-2xl shadow-md flex flex-col overflow-hidden">
            
            {/* Course info */}
            <div className="px-4 py-4 border-b border-[#e9e6ff] flex gap-3">
              {course.thumbnailUrl && (
                <div className="relative">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-14 h-14 rounded-xl object-cover border border-[#e9e6ff]"
                  />
                  {course.level && (
                    <span className="absolute -bottom-1 -right-1 text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white border border-white shadow-sm">
                      {course.level}
                    </span>
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.14em]">
                  Course
                </p>
                <h1 className="text-[15px] font-semibold text-slate-900 leading-snug line-clamp-2">
                  {course.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-700">
                  {course.category && (
                    <span className="px-2 py-0.5 rounded-full bg-[#F5F3FF] border border-[#9E8CFF]/30 text-[#4B3ABF]">
                      {course.category}
                    </span>
                  )}
                  <span className="text-slate-600 font-medium">
                    {Math.round(progress.percentage || 0)}% complete
                  </span>
                </div>
              </div>
            </div>

            {/* Sections + videos */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {sections.map((section, sIdx) => (
                <div
                  key={section._id}
                  className="rounded-xl bg-white border border-[#e9e6ff] overflow-hidden shadow-sm"
                >
                  <div className="px-3 py-2.5 flex items-center justify-between bg-gradient-to-r from-[#F5F3FF] to-[#EEF0FF] border-b border-[#e9e6ff]">
                    <p className="text-[13px] font-bold text-slate-900">
                      {sIdx + 1}. {section.title}
                    </p>
                    <span className="text-[11px] text-slate-600">
                      {section.items?.length || 0} videos
                    </span>
                  </div>
                  <div className="bg-white">
                    {section.items?.map((video) => {
                      const isActive =
                        currentVideo && String(currentVideo._id) === String(video._id);
                      const completed = !!completedMap[String(video._id)];
                      return (
                        <button
                          key={video._id}
                          onClick={() => handleVideoSelect(video)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                            isActive
                              ? "bg-[#EEF0FF] border-l-2 border-l-[#9380FD]"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2
                              size={18}
                              className="text-emerald-500 shrink-0"
                            />
                          ) : (
                            <PlayCircle
                              size={18}
                              className="text-[#9380FD] shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-slate-900 truncate">
                              {video.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {video.duration || "Video"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* RIGHT – Player + Details */}
          <main className="bg-white border border-[#e9e6ff] rounded-2xl shadow-md flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="px-4 md:px-6 py-4 border-b border-[#e9e6ff] flex items-center justify-between bg-gradient-to-r from-[#F5F3FF] to-white">
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-[0.15em]">
                  Now Playing
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 line-clamp-2 mt-1">
                  {currentVideo?.title || "Select a video from the playlist"}
                </h2>
              </div>
              <div className="text-[11px] text-slate-700 text-right">
                <p className="font-semibold text-sm text-[#4B3ABF]">
                  {Math.round(progress.percentage || 0)}%
                </p>
                <p className="text-slate-500">
                  {savingProgress ? "Saving…" : "Auto-saved"}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 md:p-6 flex flex-col gap-3">
              {/* Video Player */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-lg">
                {currentVideo?.videoUrl ? (
                  <video
                    key={currentVideo.videoUrl}
                    src={currentVideo.videoUrl}
                    controls
                    onEnded={handleVideoEnd}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                    <div className="p-3 rounded-full bg-white border border-slate-200 mb-3">
                      <Video size={32} className="text-slate-400" />
                    </div>
                    <p className="text-[13px] text-slate-600">
                      Select a video from the left to start learning.
                    </p>
                  </div>
                )}
              </div>

              {/* Description / status */}
              {currentVideo?.description && (
                <div className="bg-[#F5F3FF] border border-[#e9e6ff] rounded-xl px-4 py-3 text-[14px] md:text-[15px] text-slate-700">
                  {currentVideo.description}
                </div>
              )}

              {currentVideo && (
                <div className="mt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="text-[13px] text-slate-600 max-w-xl">
                    {completedMap[String(currentVideo._id)]
                      ? "✓ This video is marked as completed."
                      : "This video will be marked as completed once it ends, or you can mark it manually."}
                  </div>

                  {!completedMap[String(currentVideo._id)] && (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => markCompleted(currentVideo)}
                      disabled={savingProgress}
                      className="px-5 py-2.5 text-[13px] rounded-xl cursor-pointer bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-semibold disabled:opacity-60 shadow-lg"
                    >
                      {savingProgress ? "Saving..." : "Mark as Completed"}
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}