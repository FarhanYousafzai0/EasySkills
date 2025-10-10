'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Layers, ClipboardPlus } from 'lucide-react';
import AllBatches from './AllBatches';
import AddBatch from './AddBatch';

const BatchDashboard = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'add'

  return (
    <section className="w-full bg-white shadow-md rounded-2xl p-6 md:p-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="text-[#9380FD]" /> Batch Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your training batches, add new groups, and monitor students.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-full text-sm font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 rounded-full transition-all duration-300 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Batches
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-5 py-2 rounded-full transition-all duration-300 ${
              activeTab === 'add'
                ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Add New
          </button>
        </div>
      </div>

      {/* Animated Section Switch */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'all' ? (
            <motion.div
              key="all-batches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <AllBatches />
            </motion.div>
          ) : (
            <motion.div
              key="add-batch"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
             <AddBatch/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default BatchDashboard;
