'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Filter, FileText, User, ChevronDown } from 'lucide-react';

const demo = [
  { id:'SUB-1', student:'Ali Khan', batch:'Batch 1', task:'Week 2 Worksheet', submittedAt:'2025-10-12', status:'pending', link:'#' },
  { id:'SUB-2', student:'Sara Malik', batch:'Batch 2', task:'Git Basics Quiz', submittedAt:'2025-10-11', status:'pending', link:'#' },
];

const batches = ['All','Batch 1','Batch 2','Batch 3'];

export default function PreviewSubmissions() {
  const [items, setItems] = useState(demo);
  const [batch, setBatch] = useState('All');
  const [openFilter, setOpenFilter] = useState(false);

  const filtered = items.filter(i => batch==='All' || i.batch===batch);

  const mark = (id, status) => {
    setItems(prev => prev.map(i => i.id===id ? {...i, status} : i));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-md rounded-2xl"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-[#9380FD]" /> Preview Submissions
        </h2>

        {/* Animated Filter Dropdown */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setOpenFilter(!openFilter)}
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
          >
            <Filter size={16} />
            {batch === 'All' ? 'Filter by Batch' : batch}
            <motion.span animate={{ rotate: openFilter ? 180 : 0 }}>
              <ChevronDown size={14} />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {openFilter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-md rounded-xl z-20"
              >
                {batches.map((b) => (
                  <motion.button
                    key={b}
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    onClick={() => { setBatch(b); setOpenFilter(false); }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-lg ${
                      b === batch
                        ? 'bg-gradient-to-r from-[#9380FD]/80 to-[#7866FA]/80 text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {b}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s) => (
          <motion.div
            key={s.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs text-gray-400 mb-1">#{s.id}</p>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User className="h-4 w-4 text-[#7866FA]" /> {s.student}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Batch: <span className="font-medium text-gray-800">{s.batch}</span>
              </p>
              <p className="text-sm text-gray-600">
                Task: <span className="font-medium">{s.task}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Submitted: {new Date(s.submittedAt).toLocaleDateString()}
              </p>

              <a
                href={s.link}
                className="text-sm text-[#7866FA] underline mt-3 inline-block hover:opacity-80"
              >
                Open Submission
              </a>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-between items-center mt-5">
              <span
                className={`text-xs px-3 py-1 rounded-full capitalize ${
                  s.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : s.status === 'changes'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {s.status}
              </span>

              <div className="flex gap-2 flex-wrap justify-end">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => mark(s.id, 'approved')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:opacity-90 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 size={14} /> Approve
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => mark(s.id, 'changes')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:opacity-90 flex items-center gap-1 cursor-pointer"
                >
                  <XCircle size={14} /> Changes
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
