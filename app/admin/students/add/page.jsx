'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Loader2, Calendar, Clock3, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function AddStudent() {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', plan: '', batch: '', joinDate: '',
  });

  const plans = [
    { label: '1-on-1 Mentorship', duration: 30 },
    { label: 'Group Mentorship', duration: 45 },
    
  ];

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setForm((p) => ({ ...p, joinDate: today }));
    (async () => {
      const res = await fetch('/api/admin/batches', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setBatches(data.data);
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/admin/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Student added successfully!');
      setForm({ name: '', email: '', phone: '', plan: '', batch: '', joinDate: new Date().toISOString().split('T')[0] });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = plans.find((p) => p.label === form.plan);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 bg-white/70 backdrop-blur-lg border border-gray-200 shadow-md rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UserPlus className="text-[#9380FD]" /> Add New Student
        </h2>
        {form.plan && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-[#ECCFFE]/60 px-3 py-1 rounded-lg">
            <Clock3 className="h-4 w-4 text-[#7866FA]" />
            <span>{currentPlan?.duration} Days Duration</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['name', 'email', 'phone'].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
            <input
              type={key === 'email' ? 'email' : 'text'}
              value={form[key]} required={key !== 'phone'}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#9380FD]"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mentorship Plan</label>
          <select value={form.plan} required
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:border-[#9380FD]">
            <option value="">Select Mentorship Plan</option>
            {plans.map((p) => <option key={p.label}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign Batch <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <select
            value={form.batch}
            onChange={(e) => setForm({ ...form, batch: e.target.value })}
            disabled={form.plan === '1-on-1 Mentorship'}
            className={`w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none ${
              form.plan === '1-on-1 Mentorship' ? 'opacity-50 cursor-not-allowed' : 'focus:border-[#9380FD]'
            }`}>
            <option value="">Select Batch</option>
            {batches.map((b) => (
              <option key={b._id} value={b.title}>{b.title}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#9380FD]" /> Join Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={form.joinDate}
              onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#9380FD] bg-white cursor-pointer"
            />
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-500" />
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="relative cursor-pointer bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white px-8 py-2 rounded-lg flex items-center gap-2 font-semibold shadow-md overflow-hidden group">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            {loading ? 'Adding...' : 'Add Student'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
