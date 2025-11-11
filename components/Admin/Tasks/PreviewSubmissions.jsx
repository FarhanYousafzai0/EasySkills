'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Award, MessageSquare, CheckCircle2, Loader2,
  ChevronDown, Filter, User, FileText
} from 'lucide-react';

export default function PreviewSubmissions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState('All');
  const [batches, setBatches] = useState(['All']);
  const [modal, setModal] = useState({
    open: false,
    sub: null,
    score: '',
    message: '',
    status: 'graded'
  });

  // 🧠 Fetch all submissions
  const fetchSubs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/submissions${batch !== 'All' ? `?batch=${batch}` : ''}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setSubs(data.data);
        const uniq = ['All', ...new Set(data.data.map((s) => s.studentId?.batch).filter(Boolean))];
        setBatches(uniq);
      } else toast.error(data.message);
    } catch {
      toast.error('Server error loading submissions');
    } finally {
      setLoading(false);
    }
  }, [batch]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  // 🧾 Save feedback + score
  const saveFeedback = async () => {
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: modal.sub._id,
          feedbackMessage: modal.message,
          score: Number(modal.score),
          status: modal.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Feedback saved');
        setModal({ open: false, sub: null, score: '', message: '', status: 'graded' });
        fetchSubs();
      } else toast.error(data.message);
    } catch {
      toast.error('Error saving feedback');
    }
  };

  if (loading)
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#7866FA]" />
      </div>
    );

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-[#9380FD]" /> Task Submissions
        </h1>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setBatches([...batches])}
            className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow-sm text-sm text-gray-700 cursor-pointer"
          >
            <Filter size={16} />
            {batch === 'All' ? 'All Batches' : batch}
            <ChevronDown size={14} />
          </button>
          <div className="absolute mt-2 w-40 bg-white border rounded-xl shadow-md">
            {batches.map((b) => (
              <button
                key={b}
                onClick={() => setBatch(b)}
                className={`block w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-100 ${
                  batch === b ? 'bg-[#9380FD]/10 text-[#7866FA] font-semibold' : ''
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID */}
      {subs.length === 0 ? (
        <p className="text-center text-gray-500 mt-16">No submissions found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subs.map((s, i) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer"
            >
              <div>
                {/* HEADER */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[#7866FA]" />
                    <h3 className="text-base font-semibold text-gray-800">
                      {s.studentId?.name || 'Unknown'}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                      s.status === 'graded'
                        ? 'bg-green-100 text-green-700'
                        : s.status === 'changes'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-1">{s.studentId?.batch}</p>
                <p className="text-sm text-gray-800 font-medium mb-2">{s.taskTitle || 'Untitled Task'}</p>
                <p className="text-xs text-gray-400 mb-3">
                  Submitted {new Date(s.submittedAt).toLocaleDateString()}
                </p>

                {/* FEEDBACK THREAD */}
                {s.feedback?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg border-l-4 border-[#7866FA] p-3 mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                      <MessageSquare size={13} className="text-[#7866FA]" />
                      Feedback Thread
                    </div>
                    <div className="space-y-1.5">
                      {s.feedback.slice(-2).map((fb, idx) => (
                        <div key={idx} className="text-sm text-gray-700 bg-white/70 rounded-lg p-2 border border-gray-100">
                          <p>{fb.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(fb.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="mt-3 border-t pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
                  <Award size={16} className="text-yellow-500" />
                  Score: {s.score ?? 0}
                </div>
                <button
                  onClick={() => setModal({ ...modal, open: true, sub: s })}
                  className="text-xs px-3 py-1.5 rounded-lg text-white bg-gradient-to-r from-[#9380FD] to-[#7866FA] hover:opacity-90 shadow cursor-pointer"
                >
                  Add Feedback
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FEEDBACK MODAL */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageSquare className="text-[#7866FA]" /> Add Feedback & Grade
              </h3>

              <textarea
                rows={3}
                placeholder="Write feedback for the student..."
                value={modal.message}
                onChange={(e) => setModal({ ...modal, message: e.target.value })}
                className="w-full border rounded-lg p-2 mb-3 text-sm focus:ring-2 focus:ring-[#9380FD]"
              />
              <label className="text-sm text-gray-700">Score</label>
              <input
                type="number"
                placeholder="0–100"
                value={modal.score}
                onChange={(e) => setModal({ ...modal, score: e.target.value })}
                className="w-full border rounded-lg p-2 mt-1 mb-3 text-sm focus:ring-2 focus:ring-[#9380FD]"
              />

              <label className="text-sm text-gray-700">Status</label>
              <select
                value={modal.status}
                onChange={(e) => setModal({ ...modal, status: e.target.value })}
                className="w-full border rounded-lg p-2 mt-1 mb-5 text-sm"
              >
                <option value="graded">Graded</option>
                <option value="changes">Needs Changes</option>
                <option value="reviewed">Reviewed</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModal({ ...modal, open: false })}
                  className="text-gray-600 cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveFeedback}
                  className="text-sm px-4 py-2 cursor-pointer rounded-lg bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow hover:opacity-90"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
