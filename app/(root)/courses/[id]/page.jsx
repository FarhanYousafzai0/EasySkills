"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentVideo, setCurrentVideo] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [savingProgress, setSavingProgress] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/courses/${id}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setCourse(data.course);
        setSections(data.sections || []);
        setProgressMap(data.progressMap || {});

        // pick current video
        let curr = null;
        if (data.currentVideoId) {
          sectionsLoop: for (const sec of data.sections || []) {
            for (const v of sec.videos || []) {
              if (v._id === data.currentVideoId) {
                curr = v;
                break sectionsLoop;
              }
            }
          }
        }
        if (!curr) {
          curr = data.sections?.[0]?.videos?.[0] || null;
        }
        setCurrentVideo(curr || null);
      } else {
        toast.error(data.message || "Error loading course");
      }
    } catch {
      toast.error("Server error loading course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const markCompleted = async (video) => {
    if (!video?._id) return;
    setSavingProgress(true);
    try {
      const res = await fetch("/api/student/courses/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: id,
          videoId: video._id,
          completed: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProgressMap((prev) => ({ ...prev, [video._id]: true }));
      } else {
        toast.error(data.message || "Error updating progress");
      }
    } catch {
      toast.error("Server error updating progress");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleVideoEnd = () => {
    if (currentVideo) markCompleted(currentVideo);
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-50">
        <Loader2 size={32} className="animate-spin text-[#7866FA]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row">
      {/* LEFT – Video List */}
      <aside className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-white/10 bg-slate-900/95 backdrop-blur-lg flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-white/10 flex items-center justify-between">
          <button
            onClick={() => router.push("/student/courses")}
            className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white"
          >
            <ArrowLeft size={14} /> Back to courses
          </button>
          <span className="text-[11px] text-slate-400">
            {course.totalVideos || 0} videos
          </span>
        </div>

        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide">
            Course
          </p>
          <h1 className="text-sm font-semibold text-slate-50 leading-snug">
            {course.title}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {sections.map((section, idx) => (
            <div
              key={section._id}
              className="rounded-xl bg-slate-900/80 border border-white/10 overflow-hidden"
            >
              <div className="px-3 py-2.5 flex items-center justify-between bg-slate-900/90">
                <p className="text-xs font-semibold">
                  {idx + 1}. {section.title}
                </p>
              </div>
              <div className="bg-slate-950/60">
                {section.videos?.map((video) => {
                  const isActive = currentVideo?._id === video._id;
                  const completed = !!progressMap[video._id];
                  return (
                    <button
                      key={video._id}
                      onClick={() => setCurrentVideo(video)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-800/80 ${
                        isActive ? "bg-slate-800/90" : ""
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
                        <p className="text-[10px] text-slate-400">
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

      {/* RIGHT – Player */}
      <main className="flex-1 flex flex-col">
        <div className="px-4 md:px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">
              Now Playing
            </p>
            <h2 className="text-sm md:text-base font-semibold text-white">
              {currentVideo?.title || "Select a video"}
            </h2>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 flex flex-col">
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden mb-4 border border-white/10">
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

          {currentVideo?.description && (
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-200">
              {currentVideo.description}
            </div>
          )}

          {currentVideo && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {progressMap[currentVideo._id]
                  ? "Marked as completed"
                  : "Video will be marked completed once finished"}
              </div>
              {!progressMap[currentVideo._id] && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => markCompleted(currentVideo)}
                  disabled={savingProgress}
                  className="px-3 py-1.5 text-xs rounded-xl cursor-pointer bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-semibold disabled:opacity-60"
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
