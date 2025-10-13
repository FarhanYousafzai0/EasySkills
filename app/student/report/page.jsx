'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';

export default function NewIssuePage() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('✅ Issue submitted successfully!');
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Report a New Issue</h1>
      <p className="text-gray-600 mb-6">
        Describe the problem you’re facing in detail. Our admin will review and respond soon.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md max-w-xl mx-auto space-y-6"
      >
        <div>
          <label className="block text-gray-700 font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            placeholder="Enter issue title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#9380FD]"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#9380FD]"
          >
            <option value="">Select a category</option>
            <option>Website Bug</option>
            <option>Task Issue</option>
            <option>Live Session</option>
            <option>Payment Issue</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            name="description"
            rows={4}
            placeholder="Describe the issue in detail..."
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#9380FD]"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload Screenshot (optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-[#9380FD] transition">
            <UploadCloud size={28} className="text-[#7866FA] mb-2" />
            <input
              type="file"
              id="fileUpload"
              className="hidden"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, file: e.target.files[0] }))
              }
            />
            <label
              htmlFor="fileUpload"
              className="text-sm text-gray-600 cursor-pointer"
            >
              {form.file ? form.file.name : 'Click to upload or drag & drop'}
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 cursor-pointer rounded-lg bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-semibold hover:opacity-90 transition"
        >
          Submit Issue
        </button>
      </motion.form>
    </div>
  );
}
