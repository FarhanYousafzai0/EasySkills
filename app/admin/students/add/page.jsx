'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Loader2, Calendar, ChevronDown, BookOpenCheck, Mail, CheckCircle, AlertCircle } from 'lucide-react';
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

      // ✅ CRITICAL FIX: Auto-set isEnrolled based on selected courses
      const submissionData = {
        ...form,
        isEnrolled: form.enrolledCourses.length > 0, // Automatically set to true if courses selected
      };

      console.log('📤 Submitting data:', submissionData);

      const res = await fetch('/api/admin/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      console.log('✅ Response:', data);

      // ✅ Enhanced success messages with email status
      if (data.emailSent) {
        toast.success(
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
            <div>
              <p className="font-semibold text-gray-900">Student added successfully!</p>
              <p className="text-sm text-gray-600 mt-1">
                📧 Invitation email sent to <strong>{form.email}</strong>
              </p>
              {data.data?.isEnrolled && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Enrolled in {data.data.enrolledCourses.length} course(s)
                </p>
              )}
            </div>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.warning(
          <div className="flex items-center gap-3">
            <AlertCircle className="text-orange-500 flex-shrink-0" size={24} />
            <div>
              <p className="font-semibold text-gray-900">Student added successfully!</p>
              <p className="text-sm text-gray-600 mt-1">
                ⚠️ Email sending failed: {data.emailError || 'Unknown error'}
              </p>
              {data.invitationLink && (
                <p className="text-xs text-blue-600 mt-1">
                  Check console for invitation link
                </p>
              )}
            </div>
          </div>,
          { duration: 8000 }
        );

        // Log invitation link for manual sending
        if (data.invitationLink) {
          console.log('📧 INVITATION LINK (send manually):', data.invitationLink);
        }
      }

      // Reset form
      setForm({
        name: '',
        email: '',
        phone: '',
        plan: '',
        batch: '',
        joinDate: new Date().toISOString().split('T')[0],
        enrolledCourses: [],
      });
      setShowCourses(false);
    } catch (err) {
      console.error('❌ Error:', err);
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
            (form.plan === '1-on-1 Mentorship' ? 30 : 45) * 24 * 60 * 60 * 1000
        )
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 bg-white/70 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="text-[#9380FD]" />
            Add New Student
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Create a new student account and send invitation email
          </p>
        </div>

        {currentPlan && (
          <div className="flex items-center gap-2 text-sm text-gray-700 bg-[#ECCFFE]/60 px-4 py-2 rounded-lg">
            <BookOpenCheck className="h-4 w-4 text-[#7866FA]" />
            <span className="font-medium">{currentPlan.duration}-Day Cycle</span>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Inputs */}
        {[
          { key: 'name', label: 'Full Name', type: 'text', required: true },
          { key: 'email', label: 'Email Address', type: 'email', required: true },
          { key: 'phone', label: 'Phone Number', type: 'text', required: false },
        ].map(({ key, label, type, required }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={type}
              value={form[key]}
              required={required}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#9380FD] focus:ring-2 focus:ring-[#9380FD]/20 focus:outline-none transition"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        ))}

        {/* Mentorship Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mentorship Plan <span className="text-red-500">*</span>
          </label>
          <select
            value={form.plan}
            required
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#9380FD] focus:ring-2 focus:ring-[#9380FD]/20 focus:outline-none transition bg-white"
          >
            <option value="">Select Mentorship Plan</option>
            {plans.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label} ({p.duration} days)
              </option>
            ))}
          </select>
        </div>

        {/* Batch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Batch
          </label>
          <select
            value={form.batch}
            disabled={form.plan === '1-on-1 Mentorship'}
            onChange={(e) => setForm({ ...form, batch: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#9380FD] focus:ring-2 focus:ring-[#9380FD]/20 focus:outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
          >
            <option value="">
              {form.plan === '1-on-1 Mentorship' ? 'Not applicable for 1-on-1' : 'Select Batch'}
            </option>
            {batches.map((b) => (
              <option key={b._id} value={b.title}>
                {b.title}
              </option>
            ))}
          </select>
        </div>

        {/* Join Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Join Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.joinDate}
            required
            onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#9380FD] focus:ring-2 focus:ring-[#9380FD]/20 focus:outline-none transition"
          />
          {endDate && (
            <p className="text-xs mt-2 text-gray-600 flex items-center gap-1">
              <Calendar size={12} className="text-[#7866FA]" />
              Mentorship ends on{' '}
              <span className="font-semibold text-[#7866FA]">
                {endDate.toLocaleDateString()}
              </span>
            </p>
          )}
        </div>

        {/* COURSE SELECTION */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enroll in Courses (Optional)
          </label>

          <button
            type="button"
            onClick={() => setShowCourses(!showCourses)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white flex justify-between items-center hover:border-[#9380FD] transition focus:outline-none focus:ring-2 focus:ring-[#9380FD]/20"
          >
            <span className="text-gray-700 flex items-center gap-2">
              {form.enrolledCourses.length > 0 ? (
                <>
                  <CheckCircle size={16} className="text-green-500" />
                  {form.enrolledCourses.length} Course
                  {form.enrolledCourses.length > 1 ? 's' : ''} Selected
                </>
              ) : (
                <>
                  <BookOpenCheck size={16} className="text-gray-400" />
                  Select Courses
                </>
              )}
            </span>
            <ChevronDown
              className={`h-5 w-5 text-gray-600 transition-transform ${
                showCourses ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showCourses && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-8 text-gray-500">
                      No courses available. Create courses first.
                    </div>
                  ) : (
                    courses.map((course) => {
                      const selected = form.enrolledCourses.includes(course._id);
                      return (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          key={course._id}
                          onClick={() => toggleCourse(course._id)}
                          className={`border rounded-xl p-4 text-left transition shadow-sm ${
                            selected
                              ? 'bg-[#7866FA]/10 border-[#7866FA] ring-2 ring-[#7866FA]/20'
                              : 'bg-white border-gray-300 hover:border-[#9380FD]'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-800 flex-1">
                              {course.title}
                            </h4>
                            {selected && (
                              <CheckCircle size={18} className="text-[#7866FA] flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.description || 'No description available'}
                          </p>
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end pt-4">
          <motion.button
            type="button"
            onClick={handleSubmit}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
            className="bg-gradient-to-r from-[#9380FD] cursor-pointer to-[#7866FA] text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Adding Student...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Add Student & Send Invitation
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}