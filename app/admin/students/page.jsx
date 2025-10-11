'use client';
import React, { useState } from 'react';
import { Edit2, Trash2, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const initialStudents = [
  { id: 1, name: 'Ali Khan', email: 'ali@example.com', batch: 'Batch 1', status: 'Active' },
  { id: 2, name: 'Sara Malik', email: 'sara@example.com', batch: 'Batch 2', status: 'Pending' },
  { id: 3, name: 'Hamza Iqbal', email: 'hamza@example.com', batch: 'Batch 1', status: 'Active' },
  { id: 4, name: 'Hina Noor', email: 'hina@example.com', batch: 'Batch 3', status: 'Active' },
  { id: 5, name: 'Adeel Raza', email: 'adeel@example.com', batch: 'Batch 2', status: 'Pending' },
];

export default function AllStudents() {
  const [students, setStudents] = useState(initialStudents);
  const [query, setQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All');

  const batches = ['All', 'Batch 1', 'Batch 2', 'Batch 3'];

  // Filter by search query and batch
  const filtered = students.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase());
    const matchesBatch = selectedBatch === 'All' || s.batch === selectedBatch;
    return matchesQuery && matchesBatch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white shadow-md rounded-2xl p-6 md:p-10"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Students</h2>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full sm:w-auto">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              placeholder="Search students..."
              className="bg-transparent outline-none text-sm text-gray-700 w-full sm:w-40"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Batch Filter */}
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-all">
            <Filter size={18} className="text-gray-500 mr-2" />
            <select
              className="bg-transparent outline-none text-sm text-gray-700"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              {batches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="text-left p-3 rounded-l-lg">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Batch</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3 rounded-r-lg">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-6">
                  No students found for this filter.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <motion.tr
                  key={s.id}
                  whileHover={{ scale: 1.01 }}
                  className="border-b border-gray-200 text-gray-800 hover:bg-gray-50"
                >
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.batch}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        s.status === 'Active'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-right flex justify-end gap-3">
                    <button className="bg-gradient-to-r cursor-pointer from-[#9380FD] to-[#7866FA] text-white p-2 rounded-lg hover:opacity-90">
                      <Edit2 size={16} />
                    </button>
                    <button className="bg-red-500 cursor-pointer text-white p-2 rounded-lg hover:bg-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
