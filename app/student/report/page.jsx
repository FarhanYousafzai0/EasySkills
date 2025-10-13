'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle2 } from 'lucide-react';

export default function AddReportPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Issue');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('⚠️ Please fill in all required fields.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Report an Issue</h1>
      <p className="text-gray-600 mb-6">
        Having trouble with your dashboard or a session? Submit your issue or feedback below.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg max-w-lg mx-auto space-y-6 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-[#9380FD]/10">
            <MessageSquare size={22} className="text-[#7866FA]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Submit Report</h2>
        </div>

        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter report title"
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9380FD]"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9380FD]"
          >
            <option value="Issue">Issue</option>
            <option value="Feedback">Feedback</option>
            <option value="Suggestion">Suggestion</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or feedback..."
            className="w-full h-28 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9380FD]"
          ></textarea>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-semibold shadow-md hover:shadow-lg cursor-pointer transition-all"
        >
          Submit Report
        </motion.button>

        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-green-600 font-medium text-sm bg-green-50 border border-green-200 rounded-lg p-3 mt-4"
          >
            <CheckCircle2 size={18} />
            Report submitted successfully!
          </motion.div>
        )}
      </motion.form>
    </div>
  );
}
