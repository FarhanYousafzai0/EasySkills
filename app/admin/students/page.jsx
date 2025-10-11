'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit2,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Clock3,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

const initialStudents = [
  { id: 1, name: 'Ali Khan', email: 'ali@example.com', batch: 'Batch 1', status: 'Active', daysLeft: 24 },
  { id: 2, name: 'Sara Malik', email: 'sara@example.com', batch: 'Batch 2', status: 'Pending', daysLeft: 9 },
  { id: 3, name: 'Hamza Iqbal', email: 'hamza@example.com', batch: 'Batch 1', status: 'Active', daysLeft: 4 },
  { id: 4, name: 'Hina Noor', email: 'hina@example.com', batch: 'Batch 3', status: 'Active', daysLeft: 13 },
  { id: 5, name: 'Adeel Raza', email: 'adeel@example.com', batch: 'Batch 2', status: 'Pending', daysLeft: 17 },
  { id: 6, name: 'Amna Faisal', email: 'amna@example.com', batch: 'Batch 3', status: 'Active', daysLeft: 3 },
  { id: 7, name: 'Tariq Ahmed', email: 'tariq@example.com', batch: 'Batch 1', status: 'Pending', daysLeft: 27 },
  { id: 8, name: 'Iqra Zaman', email: 'iqra@example.com', batch: 'Batch 2', status: 'Active', daysLeft: 14 },
];

export default function AllStudents() {
  const [students, setStudents] = useState(initialStudents);
  const [query, setQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const batches = ['All', 'Batch 1', 'Batch 2', 'Batch 3'];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.filter-container')) setFilterOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesQuery =
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase());
      const matchesBatch = selectedBatch === 'All' || s.batch === selectedBatch;
      return matchesQuery && matchesBatch;
    });
  }, [students, query, selectedBatch]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginated = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getBadgeColor = (status, days) => {
    if (days <= 5) return 'bg-red-100 text-red-700';
    if (days <= 14) return 'bg-amber-100 text-amber-700';
    return status === 'Active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/70 backdrop-blur-lg shadow-md border border-gray-200/50 rounded-2xl p-6 md:p-10"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Users className="text-[#9380FD]" />
          <h2 className="text-2xl font-bold text-gray-800">All Students</h2>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <motion.div
            whileFocus={{ scale: 1.02 }}
            className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full sm:w-auto"
          >
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              placeholder="Search students..."
              className="bg-transparent outline-none text-sm text-gray-700 w-full sm:w-48"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </motion.div>

          {/* Batch Filter (Animated Dropdown) */}
          <div className="filter-container relative">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilterOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-all"
            >
              <Filter size={18} className="text-gray-600" />
              <span className="text-sm text-gray-700">
                {selectedBatch === 'All' ? 'Filter by Batch' : selectedBatch}
              </span>
              <motion.span
                animate={{ rotate: filterOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-gray-600" />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg rounded-xl z-20"
                >
                  {batches.map((batch) => (
                    <motion.button
                      key={batch}
                      whileHover={{ x: 5 }}
                      onClick={() => {
                        setSelectedBatch(batch);
                        setFilterOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-all rounded-lg ${
                        selectedBatch === batch
                          ? 'bg-gradient-to-r from-[#9380FD]/80 to-[#7866FA]/80 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {batch}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* STUDENT GRID */}
      <AnimatePresence>
        {paginated.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 py-6"
          >
            No students found for this filter.
          </motion.p>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.05 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {paginated.map((s) => (
              <motion.div
                key={s.id}
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{s.name}</h3>
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="relative group cursor-pointer"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      <div className="absolute hidden group-hover:block top-6 right-0 bg-white shadow-md border border-gray-100 rounded-lg text-sm">
                        <button className="px-4 py-2 hover:bg-gray-50 w-full text-left flex items-center gap-2 text-gray-700">
                          <Edit2 size={14} /> Edit
                        </button>
                        <button className="px-4 py-2 hover:bg-gray-50 w-full text-left flex items-center gap-2 text-red-600">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </motion.div>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{s.email}</p>
                  <p className="text-sm text-gray-600 mb-3">
                    🎓 <span className="font-medium">{s.batch}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${getBadgeColor(
                        s.status,
                        s.daysLeft
                      )}`}
                    >
                      {s.status} — {s.daysLeft} Days Left
                    </span>
                  </div>
                </div>

                {/* FOOTER BUTTONS */}
                <div className="flex justify-end mt-4 gap-2">
                  <button className="bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white text-xs px-4 py-2 rounded-lg hover:opacity-90 transition">
                    View
                  </button>
                  <button className="bg-gray-100 text-gray-700 text-xs px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                    Message
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-gray-700 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
