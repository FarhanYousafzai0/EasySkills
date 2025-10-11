'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Layers } from 'lucide-react';

export default function AllBatches() {
  const [batches, setBatches] = useState([
    {
      id: 1,
      title: 'AI Bootcamp Batch 1',
      description: 'Intro to AI, ML & LLMs',
      startDate: '2025-09-01',
      endDate: '2025-10-30',
    },
    {
      id: 2,
      title: 'Web Dev Batch 2',
      description: 'MERN + Next.js Full Stack Course',
      startDate: '2025-11-01',
      endDate: '2026-01-15',
    },
  ]);

  const deleteBatch = (id) => {
    setBatches(batches.filter((b) => b.id !== id));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white shadow-md rounded-2xl p-6 md:p-10 mt-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl font-bold cursor-pointer text-gray-800 flex items-center gap-2">
          <Layers className="text-[#9380FD]" size={24} /> All Batches
        </h2>
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold">{batches.length}</span> active batch(es)
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <motion.div
            key={batch.id}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-gray-200 p-5  bg-gray-50 hover:shadow-xl hover:border-[#9380FD]/40 transition-all duration-300 relative group cursor-pointer"
          >
            {/* Title & Description */}
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{batch.title}</h3>
            <p className="text-sm text-gray-600">{batch.description}</p>

            {/* Dates */}
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>
                <span className="font-medium text-gray-700">Start:</span> {batch.startDate}
              </p>
              <p>
                <span className="font-medium text-gray-700">End:</span> {batch.endDate}
              </p>
            </div>

            {/* Actions */}
            <div className="absolute top-3 right-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-md bg-gradient-to-r cursor-pointer from-[#9380FD] to-[#7866FA] text-white shadow-md hover:opacity-90"
              >
                <Edit size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => deleteBatch(batch.id)}
                className="p-2 rounded-md bg-red-500 cursor-pointer text-white shadow-md hover:bg-red-600"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
