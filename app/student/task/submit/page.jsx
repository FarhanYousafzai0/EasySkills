'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';

export default function SubmitTaskPage() {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('✅ Task submitted successfully!');
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Task</h1>
      <p className="text-gray-600 mb-6">
        Upload your task file and add any additional notes for your instructor.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md max-w-xl mx-auto space-y-6"
      >
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#9380FD] transition">
            <UploadCloud size={28} className="text-[#7866FA] mb-2" />
            <input
              type="file"
              className="hidden"
              id="fileUpload"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="fileUpload" className="text-sm text-gray-600 cursor-pointer">
              {file ? file.name : 'Click to upload or drag & drop'}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your notes..."
            className="w-full h-28 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9380FD]"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-semibold hover:opacity-90 transition"
        >
          Submit Task
        </button>
      </motion.form>
    </div>
  );
}
