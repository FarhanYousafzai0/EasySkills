"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
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
      const res = await fetch(
        `/api/student/courses/${id}?clerkId=${clerkId}`,
        { cache: "no-store" }
      );
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Error loading course");
        setLoading(false);
        return;
      }

      const payload = json.data || json;
      const courseData = payload.course || payload.data?.course || {};
      const sectionsData =
        payload.sections || courseData.sections || [];
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

      const initialVideo = pickInitialVideo(
        sectionsData,
        currentVideoId
      );

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
    // Update last watched even if not completed
    await saveProgress(video, !!completedMap[String(video._id)]);
  };

  if (!isLoaded || (loading && !course)) {
    return (
      <div className="flex items-center justify-center min-h-screen"> 
        <Loader2 size={32} className="animate-spin text-[#7866FA]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-200">
        Failed to load course.
      </div>
    );
  }

  const totalVideos =
    course.totalVideos ||
    sections.reduce(
      (acc, s) => acc + (s.items?.length || 0),
      0
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col md:flex-row">
      {/* LEFT – Playlist */}
      <aside className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/85 backdrop-blur-xl flex flex-col">
        {/* Top bar */}
        <div className="px-4 pt-4 pb-3 border-b border-white/10 flex items-center justify-between">
          <button
            onClick={() => router.push("/courses")}
            className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white"
          >
            <ArrowLeft size={14} /> Back to courses
          </button>
          <span className="text-[11px] text-slate-400">
            {totalVideos} videos
          </span>
        </div>

        {/* Course info */}
        <div className="px-4 py-3 border-b border-white/10 flex gap-3">
          {course.thumbnailUrl && (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-12 h-12 rounded-lg object-cover border border-white/10"
            />
          )}
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.14em]">
              Course
            </p>
            <h1 className="text-sm font-semibold text-slate-50 leading-snug line-clamp-2">
              {course.title}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
              {course.category && (
                <span className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-white/10">
                  {course.category}
                </span>
              )}
              <span>
                {Math.round(progress.percentage || 0)}% complete
              </span>
            </div>
          </div>
        </div>

        {/* Sections + videos */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {sections.map((section, sIdx) => (
            <div
              key={section._id}
              className="rounded-xl bg-slate-950/80 border border-white/10 overflow-hidden"
            >
              <div className="px-3 py-2.5 flex items-center justify-between bg-slate-900/90">
                <p className="text-[11px] font-semibold text-slate-100">
                  {sIdx + 1}. {section.title}
                </p>
                <span className="text-[10px] text-slate-500">
                  {section.items?.length || 0} videos
                </span>
              </div>
              <div className="bg-slate-950/70">
                {section.items?.map((video) => {
                  const isActive =
                    currentVideo && String(currentVideo._id) === String(video._id);
                  const completed = !!completedMap[String(video._id)];
                  return (
                    <button
                      key={video._id}
                      onClick={() => handleVideoSelect(video)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                        isActive
                          ? "bg-slate-800/90"
                          : "hover:bg-slate-900/80"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2
                          size={16}
                          className="text-emerald-400 shrink-0"
                        />
                      ) : (
                        <PlayCircle
                          size={16}
                          className="text-violet-300 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-slate-100 truncate">
                          {video.title}
                        </p>
                        <p className="text-[10px] text-slate-500">
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
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.15em]">
              Now Playing
            </p>
            <h2 className="text-sm md:text-base font-semibold text-white line-clamp-2">
              {currentVideo?.title || "Select a video from the playlist"}
            </h2>
          </div>
          <div className="text-[11px] text-slate-400 text-right">
            <p>
              {Math.round(progress.percentage || 0)}% course complete
            </p>
            <p className="text-slate-500">
              Progress saved automatically
              {savingProgress ? "…" : "."}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 md:p-6 flex flex-col">
          {/* Video Player */}
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.85)]">
            {currentVideo?.videoUrl ? (
              <video
                key={currentVideo.videoUrl}
                src={currentVideo.videoUrl}
                controls
                onEnded={handleVideoEnd}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                <PlayCircle size={36} className="mb-2 text-slate-700" />
                <p>Select a video from the left to start learning.</p>
              </div>
            )}
          </div>

          {/* Description / status */}
          {currentVideo?.description && (
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-3 text-[13px] text-slate-200">
              {currentVideo.description}
            </div>
          )}

          {currentVideo && (
            <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400">
                {completedMap[String(currentVideo._id)]
                  ? "This video is marked as completed."
                  : "This video will be marked as completed once it ends, or you can mark it manually."}
              </div>

              {!completedMap[String(currentVideo._id)] && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => markCompleted(currentVideo)}
                  disabled={savingProgress}
                  className="px-4 py-1.5 text-[11px] rounded-xl cursor-pointer bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-semibold disabled:opacity-60 shadow-lg shadow-violet-900/50"
                >
                  {savingProgress ? "Saving..." : "Mark as Completed"}
                </motion.button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
