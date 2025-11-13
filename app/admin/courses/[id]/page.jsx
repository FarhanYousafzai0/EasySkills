"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Layers,
  Plus,
  PlayCircle,
  Loader2,
  Trash2,
  Save,
  Video,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

// ✅ These will be replaced at build time from your .env
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function AdminCourseBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);

  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [sectionSaving, setSectionSaving] = useState(false);

  const [videoForm, setVideoForm] = useState({
    _id: null,
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    publicId: "",
  });
  const [savingVideo, setSavingVideo] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const currentSection = useMemo(
    () => sections.find((s) => s._id === activeSectionId) || null,
    [sections, activeSectionId]
  );

  const currentItem = useMemo(() => {
    if (!currentSection) return null;
    return currentSection.items?.find((v) => v._id === activeItemId) || null;
  }, [currentSection, activeItemId]);

  /* ─────────────────────── Fetch Course ─────────────────────── */

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/course/${id}`, { cache: "no-store" });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Error loading course");
        setLoading(false);
        return;
      }

      const courseData = data.data || data.course || data;
      setCourse(courseData);
      const secs = courseData.sections || data.sections || [];
      setSections(secs);

      if (secs.length > 0) {
        setActiveSectionId(secs[0]._id);
        if (secs[0].items?.length > 0) {
          const first = secs[0].items[0];
          setActiveItemId(first._id);
          setVideoForm({
            _id: first._id,
            title: first.title || "",
            description: first.description || "",
            videoUrl: first.videoUrl || "",
            duration: first.duration || "",
            publicId: first.publicId || "",
          });
        }
      }
    } catch (err) {
      console.error("Error loading course:", err);
      toast.error("Server error loading course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ─────────────────────── Section handlers ─────────────────────── */

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error("Section title is required");
      return;
    }
    setSectionSaving(true);
    try {
      const res = await fetch(`/api/admin/course/${id}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSectionTitle.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Error adding section");
        return;
      }

      const updatedSections = data.data || data.sections || [];
      setSections(updatedSections);
      const last = updatedSections[updatedSections.length - 1];
      setActiveSectionId(last?._id || null);
      setActiveItemId(null);
      setVideoForm({
        _id: null,
        title: "",
        description: "",
        videoUrl: "",
        duration: "",
        publicId: "",
      });
      setNewSectionTitle("");
      toast.success("Section added");
    } catch (err) {
      console.error("Error adding section:", err);
      toast.error("Server error adding section");
    } finally {
      setSectionSaving(false);
    }
  };

  const handleUpdateSectionTitle = async (sectionId, title) => {
    if (!title.trim()) {
      toast.error("Section title cannot be empty");
      return;
    }
    try {
      const res = await fetch(`/api/admin/course/${id}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, title: title.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Error updating section");
        return;
      }

      const updatedSections = data.data || data.sections || sections;
      setSections(updatedSections);
      toast.success("Section updated");
    } catch (err) {
      console.error("Error updating section:", err);
      toast.error("Server error updating section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Delete this section and all its videos?")) return;
    try {
      const res = await fetch(
        `/api/admin/course/${id}/sections?sectionId=${sectionId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Error deleting section");
        return;
      }
      const updatedSections = data.data || data.sections || [];
      setSections(updatedSections);

      if (activeSectionId === sectionId) {
        setActiveSectionId(updatedSections[0]?._id || null);
        const firstSection = updatedSections[0];
        if (firstSection?.items?.length) {
          const first = firstSection.items[0];
          setActiveItemId(first._id);
          setVideoForm({
            _id: first._id,
            title: first.title || "",
            description: first.description || "",
            videoUrl: first.videoUrl || "",
            duration: first.duration || "",
            publicId: first.publicId || "",
          });
        } else {
          setActiveItemId(null);
          setVideoForm({
            _id: null,
            title: "",
            description: "",
            videoUrl: "",
            duration: "",
            publicId: "",
          });
        }
      }

      toast.success("Section deleted");
    } catch (err) {
      console.error("Error deleting section:", err);
      toast.error("Server error deleting section");
    }
  };

  /* ─────────────────────── Video handlers ─────────────────────── */

  const openNewVideoForm = (sectionId) => {
    setActiveSectionId(sectionId);
    setActiveItemId(null);
    setVideoForm({
      _id: null,
      title: "",
      description: "",
      videoUrl: "",
      duration: "",
      publicId: "",
    });
  };

  const openEditVideoForm = (video, sectionId) => {
    setActiveSectionId(sectionId);
    setActiveItemId(video._id);
    setVideoForm({
      _id: video._id,
      title: video.title || "",
      description: video.description || "",
      videoUrl: video.videoUrl || "",
      duration: video.duration || "",
      publicId: video.publicId || "",
    });
  };

  const handleVideoChange = (e) => {
    const { name, value } = e.target;
    setVideoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveVideo = async () => {
    if (!activeSectionId) {
      toast.error("Select a section first");
      return;
    }
    if (!videoForm.title.trim()) {
      toast.error("Video title is required");
      return;
    }
    if (!videoForm.videoUrl.trim()) {
      toast.error("Please upload a video or paste a URL");
      return;
    }

    setSavingVideo(true);
    const method = videoForm._id ? "PUT" : "POST";
    const payload = {
      sectionId: activeSectionId,
      title: videoForm.title.trim(),
      description: videoForm.description.trim(),
      videoUrl: videoForm.videoUrl.trim(),
      duration: videoForm.duration.trim(),
      publicId: videoForm.publicId || "",
      videoId: videoForm._id || undefined,
    };

    try {
      const res = await fetch(`/api/admin/course/${id}/videos`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Error saving video");
        return;
      }

      const updatedSections = data.data || data.sections || sections;
      setSections(updatedSections);

      const sec = updatedSections.find((s) => s._id === activeSectionId);
      if (sec?.items?.length) {
        const last = videoForm._id
          ? sec.items.find((v) => v._id === videoForm._id)
          : sec.items[sec.items.length - 1];
        if (last) {
          setActiveItemId(last._id);
          setVideoForm({
            _id: last._id,
            title: last.title || "",
            description: last.description || "",
            videoUrl: last.videoUrl || "",
            duration: last.duration || "",
            publicId: last.publicId || "",
          });
        }
      } else {
        setActiveItemId(null);
      }

      toast.success(videoForm._id ? "Video updated" : "Video added");
    } catch (err) {
      console.error("Error saving video:", err);
      toast.error("Server error saving video");
    } finally {
      setSavingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm("Delete this video?")) return;
    try {
      const res = await fetch(
        `/api/admin/course/${id}/videos?videoId=${videoId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Error deleting video");
        return;
      }

      const updatedSections = data.data || data.sections || [];
      setSections(updatedSections);

      if (activeItemId === videoId) {
        const sec = updatedSections.find((s) => s._id === activeSectionId);
        if (sec?.items?.length) {
          const first = sec.items[0];
          setActiveItemId(first._id);
          setVideoForm({
            _id: first._id,
            title: first.title || "",
            description: first.description || "",
            videoUrl: first.videoUrl || "",
            duration: first.duration || "",
            publicId: first.publicId || "",
          });
        } else {
          setActiveItemId(null);
          setVideoForm({
            _id: null,
            title: "",
            description: "",
            videoUrl: "",
            duration: "",
            publicId: "",
          });
        }
      }

      toast.success("Video deleted");
    } catch (err) {
      console.error("Error deleting video:", err);
      toast.error("Server error deleting video");
    }
  };

  /* ─────────────────────── Cloudinary Upload (from PC) ─────────────────────── */

  const handleVideoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cloudinary is not configured (check NEXT_PUBLIC env vars)");
      return;
    }

    try {
      setUploadingVideo(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();

      if (uploadData.error) {
        console.error("Cloudinary error:", uploadData.error);
        toast.error(uploadData.error.message || "Cloudinary upload failed");
        return;
      }

      if (!uploadData.secure_url) {
        toast.error("No secure URL returned from Cloudinary");
        return;
      }

      setVideoForm((prev) => ({
        ...prev,
        videoUrl: uploadData.secure_url,
        publicId: uploadData.public_id || prev.publicId,
      }));

      toast.success("Video uploaded successfully");
    } catch (err) {
      console.error("Error uploading video:", err);
      toast.error("Error uploading video to Cloudinary");
    } finally {
      setUploadingVideo(false);
      // reset input so user can upload same file again if needed
      e.target.value = "";
    }
  };

  /* ─────────────────────── Render ─────────────────────── */

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-50">
        <Loader2 size={32} className="animate-spin text-[#7866FA]" />
      </div>
    );
  }

  const totalVideos = sections.reduce(
    (acc, s) => acc + (s.items?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* LEFT SIDEBAR */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-white/10 bg-slate-900/90 backdrop-blur-xl flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-white/10 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/courses")}
            className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="px-4 py-4 border-b border-white/10 flex gap-3">
          {course.thumbnailUrl && (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">
              Course
            </p>
            <h2 className="text-sm font-semibold leading-snug">
              {course.title}
            </h2>
            <p className="text-[11px] mt-1 text-slate-400">
              {course.level || course.category}
            </p>
          </div>
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {sections.map((section, idx) => (
            <div
              key={section._id}
              className={`rounded-xl border ${
                activeSectionId === section._id
                  ? "border-violet-400 bg-slate-800"
                  : "border-white/5 bg-slate-900/60"
              } overflow-hidden`}
            >
              {/* Section header */}
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-violet-300" />
                  <input
                    className="bg-transparent text-xs font-semibold outline-none w-40"
                    value={section.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setSections((prev) =>
                        prev.map((s) =>
                          s._id === section._id ? { ...s, title } : s
                        )
                      );
                    }}
                    onBlur={(e) =>
                      handleUpdateSectionTitle(section._id, e.target.value)
                    }
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <button
                    onClick={() => handleDeleteSection(section._id)}
                    className="p-1 rounded hover:bg-red-500/20 text-red-300"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Videos (items) */}
              <div className="bg-slate-950/50 border-t border-white/5">
                {section.items?.map((item) => (
                  <div
                    key={item._id}
                    role="button"
                    onClick={() => openEditVideoForm(item, section._id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-800/80 cursor-pointer ${
                      activeItemId === item._id ? "bg-slate-800" : ""
                    }`}
                  >
                    <PlayCircle
                      size={16}
                      className="text-violet-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-100 truncate">
                        {item.title}
                      </p>
                      {item.duration && (
                        <p className="text-[10px] text-slate-400">
                          {item.duration}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVideo(item._id);
                      }}
                      className="p-1 rounded hover:bg-red-500/20 text-red-300"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {/* Add video */}
                <button
                  onClick={() => openNewVideoForm(section._id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-violet-200 hover:bg-slate-800/80"
                >
                  <Plus size={14} />
                  Add video
                </button>
              </div>
            </div>
          ))}

          {/* New section input */}
          <div className="mt-3 bg-slate-900/80 border border-dashed border-violet-500/40 rounded-xl p-3">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-transparent border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none"
                placeholder="New section title"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddSection}
                disabled={sectionSaving}
                className="px-3 py-1.5 text-xs cursor-pointer rounded-lg bg-violet-500 text-white font-semibold disabled:opacity-60 flex items-center gap-1"
              >
                {sectionSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Add
              </motion.button>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT PANEL – VIDEO EDITOR / PREVIEW */}
      <main className="flex-1 bg-slate-950/95 text-slate-50 flex flex-col">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">
              Course Builder
            </p>
            <h2 className="text-lg font-semibold">{course.title}</h2>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-200 border border-violet-500/40">
            {totalVideos} videos • {sections.length} sections
          </span>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Player / Preview */}
          <div className="flex-1 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="w-full aspect-video bg-slate-900 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden mb-4">
              {videoForm.videoUrl ? (
                <video
                  key={videoForm.videoUrl}
                  src={videoForm.videoUrl}
                  controls
                  className="w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 text-sm">
                  <Video size={32} className="mb-2 text-slate-600" />
                  <p>No video selected</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a video from the left, or upload a new one.
                  </p>
                </div>
              )}
            </div>

            {currentSection && (
              <p className="text-xs text-slate-400 mb-2">
                Editing inside section:{" "}
                <span className="text-slate-100 font-semibold">
                  {currentSection.title}
                </span>
              </p>
            )}

            <h3 className="text-base font-semibold mb-1">
              {videoForm._id ? "Edit Video" : "New Video"}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload directly from your PC to Cloudinary, or paste an MP4
              URL manually if needed.
            </p>
          </div>

          {/* Video form */}
          <div className="w-full lg:w-96 xl:w-[420px] p-4 lg:p-6">
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Video Title
                </label>
                <input
                  name="title"
                  value={videoForm.title}
                  onChange={handleVideoChange}
                  className="w-full rounded-lg bg-slate-950 border border-white/10 px-2.5 py-2 text-xs outline-none focus:border-violet-400"
                  placeholder="Introduction to the course"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Short Description
                </label>
                <textarea
                  name="description"
                  value={videoForm.description}
                  onChange={handleVideoChange}
                  rows={3}
                  className="w-full rounded-lg bg-slate-950 border border-white/10 px-2.5 py-2 text-xs outline-none focus:border-violet-400"
                  placeholder="What will the student learn in this video?"
                />
              </div>

              {/* Upload from PC */}
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Upload from your PC
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="video-file-input"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoFileChange}
                  />
                  <motion.label
                    htmlFor="video-file-input"
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-gradient-to-r from-violet-500 to-[#7866FA] text-white text-xs font-semibold shadow-md hover:shadow-lg"
                  >
                    {uploadingVideo ? (
                      <>
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />{" "}
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={14} /> Choose video
                      </>
                    )}
                  </motion.label>

                  {videoForm.videoUrl && (
                    <span className="text-[10px] text-emerald-300 truncate max-w-[140px]">
                      {videoForm.videoUrl}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Uses Cloudinary unsigned upload preset. Max size depends on
                  your Cloudinary plan.
                </p>
              </div>

              {/* Manual URL override */}
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Video URL (optional manual override)
                </label>
                <input
                  name="videoUrl"
                  value={videoForm.videoUrl}
                  onChange={handleVideoChange}
                  className="w-full rounded-lg bg-slate-950 border border-white/10 px-2.5 py-2 text-xs outline-none focus:border-violet-400"
                  placeholder="https://res.cloudinary.com/.../video/upload/..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Duration (optional)
                </label>
                <input
                  name="duration"
                  value={videoForm.duration}
                  onChange={handleVideoChange}
                  className="w-full rounded-lg bg-slate-950 border border-white/10 px-2.5 py-2 text-xs outline-none focus:border-violet-400"
                  placeholder="12:34"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveVideo}
                disabled={savingVideo || uploadingVideo}
                className="w-full mt-2 rounded-xl cursor-pointer bg-gradient-to-r from-violet-500 to-[#7866FA] text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingVideo ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />{" "}
                    {videoForm._id ? "Save Changes" : "Add Video"}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
