'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Wrench,
  Loader2,
  Upload,
  DollarSign,
  Tag,
  FileText,
  Globe,
  List,
  Image as ImageIcon,
} from 'lucide-react';

export default function AddToolPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    link: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'YouTube Automation',
    'Script Writing',
    'Video Editing',
    'Thumbnail Design',
    'SEO Optimization',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (image) formData.append('image', image);

      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success('✅ Tool added successfully');
        setForm({ name: '', description: '', price: '', category: '', link: '' });
        setImage(null);
        setPreview('');
      } else {
        toast.error(data.message || 'Failed to add tool');
      }
    } catch {
      toast.error('Server error while adding tool.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl border border-gray-200 shadow-xl rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Wrench className="text-[#7866FA]" /> Add New Tool
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tool Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Tag size={16} className="text-[#7866FA]" /> Tool Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full mt-2 border rounded-xl p-3 text-sm shadow-sm focus:ring-2 focus:ring-[#9380FD] focus:outline-none"
              placeholder="Enter tool name..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FileText size={16} className="text-[#7866FA]" /> Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              required
              className="w-full mt-2 border rounded-xl p-3 text-sm shadow-sm focus:ring-2 focus:ring-[#9380FD] focus:outline-none"
              placeholder="Write a short description..."
            />
          </div>

          {/* Price & Category */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <DollarSign size={16} className="text-[#7866FA]" /> Price (PKR)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full mt-2 border rounded-xl p-3 text-sm shadow-sm focus:ring-2 focus:ring-[#9380FD]"
                placeholder="Enter price..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <List size={16} className="text-[#7866FA]" /> Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full mt-2 border rounded-xl p-3 text-sm shadow-sm focus:ring-2 focus:ring-[#9380FD]"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Globe size={16} className="text-[#7866FA]" /> Tool Link
            </label>
            <input
              name="link"
              value={form.link}
              onChange={handleChange}
              className="w-full mt-2 border rounded-xl p-3 text-sm shadow-sm focus:ring-2 focus:ring-[#9380FD]"
              placeholder="https://example.com"
            />
          </div>

          {/* Upload Image */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <ImageIcon size={16} className="text-[#7866FA]" /> Upload Image
            </label>

            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                preview
                  ? 'border-[#7866FA]/40 bg-[#9380FD]/5'
                  : 'border-gray-300 hover:border-[#9380FD]/60 bg-gray-50'
              }`}
            >
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {!preview ? (
                <label
                  htmlFor="imageUpload"
                  className="flex flex-col items-center gap-2 cursor-pointer text-gray-600"
                >
                  <Upload size={24} className="text-[#7866FA]" />
                  <span className="text-sm font-medium">
                    Click or drag an image to upload
                  </span>
                  <span className="text-xs text-gray-400">
                    Supports JPG, PNG, WebP (max 5MB)
                  </span>
                </label>
              ) : (
                <div className="flex flex-col items-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-48 h-32 object-cover rounded-lg shadow-sm border border-gray-200"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="mt-3 cursor-pointer text-sm text-[#7866FA] hover:underline"
                  >
                    Change Image
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 cursor-pointer text-base font-semibold text-white rounded-xl bg-gradient-to-r from-[#9380FD] to-[#7866FA] hover:opacity-90 flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Uploading...
              </>
            ) : (
              <>
                <Wrench size={18} /> Add Tool
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
