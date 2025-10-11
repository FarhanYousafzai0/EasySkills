'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Loader2 } from 'lucide-react';

export default function AddStudent() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    batch: '',
  });

  const batches = ['Batch 1', 'Batch 2', 'Batch 3'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Student added successfully!');
      setForm({ name: '', email: '', phone: '', batch: '' });
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 bg-white shadow-md rounded-2xl"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <UserPlus className="text-[#9380FD]" /> Add New Student
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-600 mb-1 text-sm">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#9380FD]"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1 text-sm">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#9380FD]"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1 text-sm">Phone / WhatsApp</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#9380FD]"
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1 text-sm">Assign Batch</label>
          <select
            value={form.batch}
            onChange={(e) => setForm({ ...form, batch: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:border-[#9380FD]"
          >
            <option value="">Select a batch</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white px-8 py-2 rounded-lg flex items-center gap-2 font-semibold shadow-md hover:opacity-90"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            {loading ? 'Adding...' : 'Add Student'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
