'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Loader2,
  Calendar,
  FileText,
  Clock3,
  ChevronDown,
} from 'lucide-react';

export default function AddStudent() {
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: '',
    batch: '',
    joinDate: '',
    
  });

  const batches = ['Batch 1', 'Batch 2', 'Batch 3'];
  const plans = [
    { label: '1-on-1 Mentorship', duration: 30 },
    { label: 'Group Mentorship', duration: 45 },
    { label: 'Self-Paced Course', duration: 60 },
    { label: 'Internship Access', duration: 90 },
  ];

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setForm((prev) => ({ ...prev, joinDate: today }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Student added successfully!');
      setForm({
        name: '',
        email: '',
        phone: '',
        plan: '',
        batch: '',
        joinDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }, 1200);
  };

  const currentPlan = plans.find((p) => p.label === form.plan);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 bg-white/70 backdrop-blur-lg border border-gray-200/50 shadow-md rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UserPlus className="text-[#9380FD]" /> Add New Student
        </h2>
        {form.plan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-gray-600 bg-[#ECCFFE]/60 px-3 py-1 rounded-lg"
          >
            <Clock3 className="h-4 w-4 text-[#7866FA]" />
            <span>{currentPlan?.duration} Days Duration</span>
          </motion.div>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#9380FD]"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#9380FD]"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone / WhatsApp
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#9380FD]"
          />
        </div>

        {/* Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mentorship Plan
          </label>
          <select
            value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:border-[#9380FD]"
          >
            <option value="">Select Mentorship Plan</option>
            {plans.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Batch (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign Batch <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <select
            value={form.batch}
            onChange={(e) => setForm({ ...form, batch: e.target.value })}
            disabled={form.plan === '1-on-1 Mentorship'}
            className={`w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none ${
              form.plan === '1-on-1 Mentorship'
                ? 'opacity-50 cursor-not-allowed'
                : 'focus:border-[#9380FD]'
            }`}
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>

        {/* Join Date with Animated Calendar */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#9380FD]" /> Join Date
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.joinDate}
              readOnly
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#9380FD] cursor-pointer bg-white"
            />
            <ChevronDown
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="absolute right-3 top-3.5 h-4 w-4 text-gray-500 cursor-pointer"
            />

            <AnimatePresence>
              {calendarOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-4"
                >
                  <input
                    type="date"
                    value={form.joinDate}
                    onChange={(e) =>
                      setForm({ ...form, joinDate: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#9380FD]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      
      
        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="relative bg-gradient-to-r cursor-pointer from-[#9380FD] to-[#7866FA] text-white px-8 py-2 rounded-lg flex items-center gap-2 font-semibold shadow-md overflow-hidden group"
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <UserPlus size={20} />
            )}
            {loading ? 'Adding...' : 'Add Student'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
