'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ClipboardPlus, ArrowRight } from 'lucide-react';

const AddBatch = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Batch Added:', formData);
    setFormData({ title: '', description: '', startDate: '', endDate: '' });
  };

  return (
    <section className="w-full bg-white shadow-md rounded-2xl p-6 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ClipboardPlus className="text-[#9380FD]" /> Add New Batch
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="col-span-1 md:col-span-2">
          <label className="text-gray-700 text-sm font-semibold mb-1 block">Batch Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter batch title"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#9380FD] outline-none transition"
          />
        </div>

        {/* Description */}
        <div className="col-span-1 md:col-span-2">
          <label className="text-gray-700 text-sm font-semibold mb-1 block">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Short batch description..."
            rows={3}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#9380FD] outline-none transition"
          />
        </div>

        {/* Dates */}
        <div>
          <label className="text-gray-700 text-sm font-semibold mb-1 block flex items-center gap-1">
            <Calendar size={16} /> Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#9380FD] outline-none transition"
          />
        </div>

        <div>
          <label className="text-gray-700 text-sm font-semibold mb-1 block flex items-center gap-1">
            <Calendar size={16} /> End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#9380FD] outline-none transition"
          />
        </div>

        {/* Submit Button */}
        <div className="col-span-1 md:col-span-2 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-medium rounded-lg shadow-md cursor-pointer hover:opacity-90 transition flex items-center gap-2"
          >
            Create Batch <ArrowRight size={18} />
          </motion.button>
        </div>
      </form>
    </section>
  );
};

export default AddBatch;
