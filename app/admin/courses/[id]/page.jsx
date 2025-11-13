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

      const updatedSections = data.sections || data.data || [];
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

      const updatedSections = data.sections || data.data || sections;
      setSections(updatedSections);
      toast.success("Section updated");
    } catch (err) {
      console.error("Error updating section:", err);
      toast.error("Server error updating section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
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
      const updatedSections = data.sections || data.data || [];
      setSections(updatedSections);

      if (activeSectionId === sectionId) {
        const firstSection = updatedSections[0];
        setActiveSectionId(firstSection?._id || null);

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

      const updatedSections = data.sections || data.data || sections;
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

  const handleDeleteVideo = async (videoId, sectionId) => {
    try {
      const res = await fetch(
        `/api/admin/course/${id}/videos?sectionId=${sectionId}&videoId=${videoId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Error deleting video");
        return;
      }

      const updatedSections = data.sections || data.data || [];
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

  /* ─────────────────────── Cloudinary Upload ─────────────────────── */

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
      e.target.value = "";
    }
  };

  /* ─────────────────────── Render ─────────────────────── */

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-slate-950">
        <Loader2 size={32} className="animate-spin text-[#7866FA]" />
      </div>
    );
  }

  const totalVideos = sections.reduce(
    (acc, s) => acc + (s.items?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/courses")}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100"
            >
              <ArrowLeft size={14} /> Back to courses
            </button>
            <span className="hidden md:inline-block h-4 w-px bg-slate-700" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">
                Course Builder
              </p>
              <h1 className="text-base md:text-lg font-semibold text-slate-50">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/40 text-violet-100">
              {sections.length} sections
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-100">
              {totalVideos} videos
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4 md:gap-6">
          {/* LEFT: Sections + items */}
          <aside className="bg-slate-950/70 border border-white/10 rounded-2xl p-3 md:p-4 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.60)] flex flex-col min-h-[480px]">
            {/* Course header */}
            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
              {course.thumbnailUrl && (
                <div className="relative">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover border border-white/10"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-violet-500 text-[9px] px-1.5 py-0.5 rounded-full border border-slate-900">
                    {course.level || "Course"}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Structure
                </p>
                <p className="text-xs font-medium text-slate-100 line-clamp-2">
                  {course.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {course.category || "Uncategorized"}
                </p>
              </div>
            </div>

            {/* Sections list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {sections.map((section, idx) => (
                <div
                  key={section._id}
                  className={`rounded-xl border transition-all duration-150 ${
                    activeSectionId === section._id
                      ? "border-violet-400/80 bg-slate-900/90 shadow-[0_12px_40px_rgba(91,76,255,0.35)]"
                      : "border-white/10 bg-slate-900/60 hover:border-violet-500/50 hover:bg-slate-900/80"
                  } overflow-hidden`}
                >
                  {/* Section header */}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-400/30">
                        <Layers size={14} className="text-violet-200" />
                      </div>
                      <input
                        className="bg-transparent text-xs font-semibold outline-none w-40 md:w-48 text-slate-50"
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
                      <span className="text-[10px] text-slate-500">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <button
                        onClick={() => handleDeleteSection(section._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/15 text-red-300"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-slate-950/70 border-t border-white/5">
                    {section.items?.map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => openEditVideoForm(item, section._id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                          activeItemId === item._id
                            ? "bg-slate-800"
                            : "hover:bg-slate-900"
                        }`}
                      >
                        <div className="p-1 rounded-lg bg-slate-900 border border-violet-500/40 text-violet-200 shrink-0">
                          <PlayCircle size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-slate-100 truncate">
                            {item.title}
                          </p>
                          {item.duration && (
                            <p className="text-[10px] text-slate-500">
                              {item.duration}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(item._id, section._id);
                          }}
                          className="p-1 rounded-lg hover:bg-red-500/15 text-red-300"
                        >
                          <Trash2 size={12} />
                        </button>
                      </button>
                    ))}

                    {/* Add video */}
                    <button
                      type="button"
                      onClick={() => openNewVideoForm(section._id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-violet-100 hover:bg-slate-900"
                    >
                      <Plus size={13} />
                      Add video to this section
                    </button>
                  </div>
                </div>
              ))}

              {/* New section card */}
              <div className="mt-2 bg-slate-950/70 border border-dashed border-violet-500/60 rounded-2xl p-3">
                <p className="text-[11px] text-slate-300 mb-2 font-medium">
                  Add new section
                </p>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-slate-950/80 border border-white/15 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-violet-400 text-slate-50"
                    placeholder="e.g. Getting Started"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                  />
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={handleAddSection}
                    disabled={sectionSaving}
                    className="px-3 py-2 text-xs rounded-lg bg-gradient-to-r from-[#7866FA] to-[#9380FD] text-white font-semibold disabled:opacity-60 flex items-center gap-1 shadow-md"
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

          {/* RIGHT: Player + form */}
          <main className="bg-slate-950/75 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-xl shadow-[0_22px_70px_rgba(0,0,0,0.75)] flex flex-col">
            {/* Player */}
            <div className="w-full aspect-video rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 mb-4 overflow-hidden flex items-center justify-center">
              {videoForm.videoUrl ? (
                <video
                  key={videoForm.videoUrl}
                  src={videoForm.videoUrl}
                  controls
                  className="w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 text-sm">
                  <div className="p-3 rounded-full bg-slate-900 border border-slate-700 mb-2">
                    <Video size={28} className="text-slate-400" />
                  </div>
                  <p className="text-xs md:text-sm">No video selected</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Choose a video from the left, or upload a new one below.
                  </p>
                </div>
              )}
            </div>

            {currentSection && (
              <p className="text-[11px] text-slate-400 mb-3">
                Editing inside section:{" "}
                <span className="text-slate-100 font-semibold">
                  {currentSection.title}
                </span>
              </p>
            )}

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              {/* Left side of form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-200 mb-1.5">
                    Video title
                  </label>
                  <input
                    name="title"
                    value={videoForm.title}
                    onChange={handleVideoChange}
                    className="w-full rounded-lg bg-slate-950 border border-white/15 px-3 py-2 text-xs outline-none focus:border-violet-400 text-slate-50"
                    placeholder="Introduction to the course"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-200 mb-1.5">
                    Short description
                  </label>
                  <textarea
                    name="description"
                    value={videoForm.description}
                    onChange={handleVideoChange}
                    rows={4}
                    className="w-full rounded-lg bg-slate-950 border border-white/15 px-3 py-2 text-xs outline-none focus:border-violet-400 text-slate-50 resize-none"
                    placeholder="What will the student learn in this video?"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-200 mb-1.5">
                    Duration (optional)
                  </label>
                  <input
                    name="duration"
                    value={videoForm.duration}
                    onChange={handleVideoChange}
                    className="w-full rounded-lg bg-slate-950 border border-white/15 px-3 py-2 text-xs outline-none focus:border-violet-400 text-slate-50"
                    placeholder="e.g. 12:34"
                  />
                </div>
              </div>

              {/* Right side of form */}
              <div className="space-y-3">
                {/* Upload from PC */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-200 mb-1.5">
                    Upload from your computer
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
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-gradient-to-r from-[#7866FA] to-[#9380FD] text-white text-[11px] font-semibold shadow-md"
                    >
                      {uploadingVideo ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          Choose video
                        </>
                      )}
                    </motion.label>

                    {videoForm.videoUrl && (
                      <span className="text-[10px] text-emerald-300 truncate max-w-[150px]">
                        {videoForm.videoUrl}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Uses Cloudinary unsigned upload preset. Max size depends on
                    your Cloudinary plan.
                  </p>
                </div>

                {/* Manual URL */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-200 mb-1.5">
                    Video URL (manual override)
                  </label>
                  <input
                    name="videoUrl"
                    value={videoForm.videoUrl}
                    onChange={handleVideoChange}
                    className="w-full rounded-lg bg-slate-950 border border-white/15 px-3 py-2 text-xs outline-none focus:border-violet-400 text-slate-50"
                    placeholder="https://res.cloudinary.com/.../video/upload/..."
                  />
                </div>

                <div className="pt-1">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={handleSaveVideo}
                    disabled={savingVideo || uploadingVideo}
                    className="w-full rounded-xl bg-gradient-to-r from-[#7866FA] to-[#9380FD] text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-violet-900/50"
                  >
                    {savingVideo ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        {videoForm._id ? "Save changes" : "Add video"}
                      </>
                    )}
                  </motion.button>
                  <p className="text-[10px] text-slate-500 mt-1 text-right">
                    All changes are stored instantly to MongoDB.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
