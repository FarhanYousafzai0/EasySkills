'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Layers } from 'lucide-react';

const AllBatches = () => {
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

  const deleteBatch = (id) => setBatches(batches.filter((b) => b.id !== id));

  return (
    <section className="w-full bg-white shadow-md rounded-2xl p-6 md:p-10 mt-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Layers className="text-[#9380FD]" /> All Batches
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <motion.div
            key={batch.id}
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition relative bg-gray-50 cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-800">{batch.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{batch.description}</p>

            <div className="mt-4 text-xs text-gray-500">
              <p>Start: {batch.startDate}</p>
              <p>End: {batch.endDate}</p>
            </div>

            {/* Buttons */}
            <div className="absolute top-3 right-3 flex gap-3">
              <button className="p-2 rounded-md bg-[#9380FD]/10 hover:bg-[#9380FD]/20 text-[#9380FD]">
                <Edit size={16} />
              </button>
              <button
                onClick={() => deleteBatch(batch.id)}
                className="p-2 rounded-md bg-red-100 hover:bg-red-200 text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AllBatches;
