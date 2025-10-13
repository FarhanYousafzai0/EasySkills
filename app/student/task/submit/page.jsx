'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';

export default function SubmitTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('⚠️ Please enter a task title before submitting.');
      return;
    }

    if (!file) {
      alert('⚠️ Please upload a file before submitting.');
      return;
    }

    alert(`✅ Task "${title}" submitted successfully!`);
    setTitle('');
    setDescription('');
    setFile(null);
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Task</h1>
      <p className="text-gray-600 mb-6">
        Provide your task details below, upload your file, and submit it for review.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg max-w-xl mx-auto space-y-6 border border-gray-100"
      >
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your task title"
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9380FD]"
            required
          />
        </div>

        {/* Optional Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Description <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a short description for your task..."
            className="w-full h-24 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9380FD]"
          ></textarea>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload File <span className="text-red-500">*</span>
          </label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#9380FD] hover:bg-[#9380FD]/5 transition-all cursor-pointer">
            <UploadCloud size={28} className="text-[#7866FA] mb-2" />
            <input
              type="file"
              id="fileUpload"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <p className="text-sm text-gray-600">
              {file ? (
                <span className="text-[#7866FA] font-medium">{file.name}</span>
              ) : (
                <>Click to upload or drag & drop your file here</>
              )}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-semibold shadow-md hover:shadow-lg cursor-pointer transition-all"
        >
          Submit Task
        </motion.button>
      </motion.form>
    </div>
  );
}
