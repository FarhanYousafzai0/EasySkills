"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Film, Upload, Loader2 } from "lucide-react";

export default function AdminAddCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!editId);
  const [preview, setPreview] = useState("");
  const [image, setImage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "",
    category: "",
    accessTill: "",
    price: "",
    durationLabel: "",
    isPublished: false,
  });

  const levels = ["Beginner", "Intermediate", "Advanced"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // 🔁 Load course when editing
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/admin/course/${editId}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success && data.course) {
          const c = data.course;
          setForm({
            title: c.title || "",
            description: c.description || "",
            level: c.level || "",
            category: c.category || "",
            accessTill: c.accessTill
              ? new Date(c.accessTill).toISOString().slice(0, 10)
              : "",
            price: c.price?.toString() || "",
            durationLabel: c.durationLabel || "",
            isPublished: !!c.isPublished,
          });
          setPreview(c.thumbnailUrl || "");
        } else {
          toast.error(data.message || "Course not found");
        }
      } catch {
        toast.error("Error loading course");
      } finally {
        setInitialLoading(false);
      }
    };

    if (editId) fetchCourse();
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("level", form.level);
      formData.append("category", form.category);
      formData.append("accessTill", form.accessTill || "");
      formData.append("price", form.price || "0");
      formData.append("durationLabel", form.durationLabel || "");
      formData.append("isPublished", String(form.isPublished));

      if (image) {
        formData.append("thumbnail", image);
      }

      const url = editId
        ? `/api/admin/course/${editId}`
        : "/api/admin/course";

      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editId ? "Course updated" : "Course created");
        router.push("/admin/courses");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch {
      toast.error("Server error saving course");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-50">
        <Loader2 size={32} className="animate-spin text-[#7866FA]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white">
            <Film size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {editId ? "Edit Course" : "Add New Course"}
            </h1>
            <p className="text-gray-500 text-sm">
              Define the main details. Sections & videos are managed in the
              Course Builder.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Thumbnail
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-40 h-24 md:w-48 md:h-28 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-40 h-24 md:w-48 md:h-28 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="thumbnailUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="thumbnailUpload"
                  className="inline-flex items-center cursor-pointer gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-[#9380FD]/10 text-[#7866FA] hover:bg-[#7866FA]/15"
                >
                  <Upload size={14} />
                  Upload Image
                </label>
                <p className="text-[11px] text-gray-400 mt-1">
                  Recommended 16:9. JPG / PNG / WEBP.
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9380FD] focus:border-transparent"
              placeholder="Prime: YouTube Automation Bootcamp"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9380FD] focus:border-transparent"
              placeholder="Complete YouTube Automation course to go from beginner to earning in 12 weeks..."
            />
          </div>

          {/* Level / Category / AccessTill */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9380FD] focus:border-transparent"
              >
                <option value="">Select level</option>
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9380FD] focus:border-transparent"
                placeholder="YouTube Automation, AI/ML, DSA ..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Till
              </label>
              <input
                type="date"
                name="accessTill"
                value={form.accessTill}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9380FD] focus:border-transparent"
              />
            </div>
          </div>

          {/* Price / Duration / Published */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9380FD] focus:border-transparent"
                placeholder="0 or 99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration Label
              </label>
              <input
                name="durationLabel"
                value={form.durationLabel}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#9380FD] focus:border-transparent"
                placeholder="e.g. 40+ videos • 12 weeks"
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={form.isPublished}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#7866FA] focus:ring-[#9380FD]"
                />
                Published
              </label>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            type="submit"
            className="w-full mt-2 rounded-xl cursor-pointer bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : editId ? (
              "Save Changes"
            ) : (
              "Create Course"
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
