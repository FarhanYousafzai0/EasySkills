'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Loader2, Calendar, ChevronDown, BookOpenCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AddStudent() {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCourses, setShowCourses] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: '',
    batch: '',
    joinDate: '',
    enrolledCourses: [],
  });

  const plans = [
    { label: '1-on-1 Mentorship', duration: 30 },
    { label: 'Group Mentorship', duration: 45 },
  ];

  // ✨ Load Batches + Courses
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setForm((p) => ({ ...p, joinDate: today }));

    (async () => {
      try {
        const bRes = await fetch('/api/admin/batches', { cache: 'no-store' });
        const bData = await bRes.json();
        if (bData.success) setBatches(bData.data);

        const cRes = await fetch('/api/admin/course', { cache: 'no-store' });
        const cData = await cRes.json();
        if (cData.success) setCourses(cData.data);
      } catch {
        toast.error('Failed to load batches or courses.');
      }
    })();
  }, []);

  const toggleCourse = (id) => {
    setForm((prev) => {
      const selected = [...prev.enrolledCourses];
      if (selected.includes(id)) {
        return { ...prev, enrolledCourses: selected.filter((c) => c !== id) };
      } else {
        return { ...prev, enrolledCourses: [...selected, id] };
      }
    });
  };

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

      setForm({
        name: '',
        email: '',
        phone: '',
        plan: '',
        batch: '',
        joinDate: new Date().toISOString().split('T')[0],
        enrolledCourses: [],
      });
    } catch (err) {
      toast.error(err.message || 'Error adding student.');
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = plans.find((p) => p.label === form.plan);
  const endDate =
    form.plan && form.joinDate
      ? new Date(
          new Date(form.joinDate).getTime() +
            (form.plan === '1-on-1 Mentorship' ? 30 : 45) *
              24 *
              60 *
              60 *
              1000
        )
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 bg-white/70 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus className="text-[#9380FD]" />
          Add New Student
        </h2>

        {currentPlan && (
          <div className="flex items-center gap-2 text-sm text-gray-700 bg-[#ECCFFE]/60 px-3 py-1 rounded-lg">
            <BookOpenCheck className="h-4 w-4 text-[#7866FA]" />
            <span>{currentPlan.duration}-Day Cycle</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Basic Inputs */}
        {['name', 'email', 'phone'].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {key}
            </label>
            <input
              type={key === 'email' ? 'email' : 'text'}
              value={form[key]}
              required={key !== 'phone'}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
            />
          </div>
        ))}

        {/* Mentorship Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mentorship Plan
          </label>
          <select
            value={form.plan}
            required
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Select Mentorship Plan</option>
            {plans.map((p) => (
              <option key={p.label}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Batch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign Batch
          </label>
          <select
            value={form.batch}
            disabled={form.plan === '1-on-1 Mentorship'}
            onChange={(e) => setForm({ ...form, batch: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Select Batch</option>
            {batches.map((b) => (
              <option key={b._id} value={b.title}>
                {b.title}
              </option>
            ))}
          </select>
        </div>

        {/* Join Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Join Date
          </label>
          <input
            type="date"
            value={form.joinDate}
            onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
          {endDate && (
            <p className="text-xs mt-2">
              Ends on{" "}
              <span className="font-semibold text-[#7866FA]">
                {endDate.toLocaleDateString()}
              </span>
            </p>
          )}
        </div>

        {/* COURSE SELECTION */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enroll in Courses
          </label>

          <div
            onClick={() => setShowCourses(!showCourses)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white flex justify-between items-center cursor-pointer"
          >
            <span className="text-gray-700">
              {form.enrolledCourses.length > 0
                ? `${form.enrolledCourses.length} Courses Selected`
                : "Select Courses"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-600 transition ${
                showCourses ? "rotate-180" : ""
              }`}
            />
          </div>

          <AnimatePresence>
            {showCourses && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {courses.map((course) => {
                  const selected = form.enrolledCourses.includes(course._id);
                  return (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={course._id}
                      onClick={() => toggleCourse(course._id)}
                      className={`border rounded-xl p-4 cursor-pointer shadow-sm transition
                        ${
                          selected
                            ? "bg-[#7866FA]/20 border-[#7866FA]"
                            : "bg-white border-gray-300"
                        }`}
                    >
                      <h4 className="font-semibold text-gray-800">{course.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {course.description?.slice(0, 60)}...
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            {loading ? 'Adding...' : 'Add Student'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
