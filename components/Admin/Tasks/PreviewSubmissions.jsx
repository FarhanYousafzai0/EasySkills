'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  CheckCircle2, XCircle, Filter, FileText, User, ChevronDown,
  Loader2, ExternalLink, Award, Paperclip, Link as LinkIcon
} from 'lucide-react';

export default function PreviewSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [batch, setBatch] = useState('All');
  const [batches, setBatches] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [openFilter, setOpenFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [gradeInput, setGradeInput] = useState('');

  // 🧠 Fetch all submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/admin/submissions${batch !== 'All' ? `?batch=${encodeURIComponent(batch)}` : ''}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        if (data.success) {
          setSubmissions(data.data);
          const uniqueBatches = ['All', ...new Set(data.data.map((s) => s.batch).filter(Boolean))];
          setBatches(uniqueBatches);
        } else toast.error(data.message || 'Failed to load submissions.');
      } catch {
        toast.error('Server error fetching submissions.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [batch]);

  // ✅ Update status / grade
  const handleUpdate = async (id, status, score) => {
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id, status, score }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Submission updated!');
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: status.toLowerCase(), score: score ?? s.score } : s
          )
        );
      } else toast.error(data.message || 'Error updating submission');
    } catch {
      toast.error('Failed to update submission.');
    }
  };

  const handleGradeSubmit = () => {
    if (!gradeInput || isNaN(gradeInput)) return toast.error('Enter a valid number');
    handleUpdate(selectedId, 'graded', Number(gradeInput));
    setShowModal(false);
    setGradeInput('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-md rounded-2xl"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-[#9380FD]" /> Student Submissions
        </h2>

        {/* Filter Dropdown */}
        <div className="relative">
          <motion.button whileTap={{ scale: 0.96 }}
            onClick={() => setOpenFilter(!openFilter)}
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-200 cursor-pointer">
            <Filter size={16} />
            {batch === 'All' ? 'Filter by Batch' : batch}
            <motion.span animate={{ rotate: openFilter ? 180 : 0 }}>
              <ChevronDown size={14} />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {openFilter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-md rounded-xl z-20"
              >
                {batches.map((b) => (
                  <motion.button
                    key={b}
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    onClick={() => { setBatch(b); setOpenFilter(false); }}
                    className={`w-full text-left px-4 py-2 cursor-pointer text-sm rounded-lg ${
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

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-600">
          <Loader2 className="animate-spin mr-2" /> Loading submissions...
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No submissions found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((s) => (
            <motion.div key={s.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <p className="text-xs text-gray-400 mb-1">#{s.id.slice(-6)}</p>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#7866FA]" /> {s.studentName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">{s.batch}</span> • {s.taskTitle}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Submitted: {new Date(s.submittedAt).toLocaleDateString()}
                </p>

                {/* External Link */}
                {s.submissionLink && (
                  <a href={s.submissionLink} target="_blank"
                    className="block mt-3 text-sm font-medium text-[#7866FA] hover:text-[#5a48e8] underline flex items-center gap-1">
                    <LinkIcon size={14} /> View Submission Link
                  </a>
                )}

                {/* File Attachments */}
                {s.files?.length > 0 && (
                  <div className="mt-4 bg-gray-50 p-3 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Paperclip size={14} /> Attached Files
                    </p>
                    <div className="space-y-1">
                      {s.files.map((f, i) => {
                        const isPreviewable = /\.(pdf|jpg|jpeg|png)$/i.test(f.originalName);
                        return (
                          <div key={i} className="flex items-center justify-between text-xs text-gray-700">
                            <a
                              href={f.fileUrl}
                              target="_blank"
                              className="flex items-center gap-1 text-[#7866FA] hover:text-[#5a48e8] underline"
                            >
                              <ExternalLink size={12} /> {f.originalName}
                            </a>
                            {isPreviewable && (
                              <a href={f.fileUrl} target="_blank" className="text-gray-400 hover:text-gray-600">
                                Preview
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-between items-center mt-5">
                <span className={`text-xs px-3 py-1 rounded-full capitalize ${
                  s.status === 'graded'
                    ? 'bg-green-100 text-green-700'
                    : s.status === 'changes'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {s.status === 'graded' ? `Graded (${s.score})` : s.status}
                </span>

                <div className="flex gap-2 flex-wrap justify-end">
                  <motion.button whileTap={{ scale: 0.96 }}
                    onClick={() => { setShowModal(true); setSelectedId(s.id); }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r cursor-pointer from-emerald-500 to-emerald-600 text-white hover:opacity-90 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Grade
                  </motion.button>

                  <motion.button whileTap={{ scale: 0.96 }}
                    onClick={() => handleUpdate(s.id, 'changes')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r cursor-pointer from-amber-400 to-amber-500 text-white hover:opacity-90 flex items-center gap-1">
                    <XCircle size={14} /> Changes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* GRADE MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Award className="text-yellow-500" /> Assign Grade
              </h3>
              <input
                type="number"
                placeholder="Enter score (0-100)"
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-3 focus:outline-none focus:ring-2 focus:ring-[#7866FA]"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowModal(false)} className="text-gray-600 cursor-pointer text-sm px-4 py-2">
                  Cancel
                </button>
                <button onClick={handleGradeSubmit}
                  className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r cursor-pointer from-[#9380FD] to-[#7866FA] text-white">
                  Submit Grade
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
