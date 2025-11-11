'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/report', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setReports(data.reports || []);
      else toast.error(data.message || 'Failed to load reports.');
    } catch (err) {
      toast.error('Server error while loading reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Submit feedback
  const handleFeedbackSubmit = async () => {
    if (!feedbackMessage.trim()) return toast.error('Please enter feedback.');
    try {
      const res = await fetch('/api/admin/report', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: activeReport._id,
          feedbackMessage,
          newStatus: 'reviewed',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Feedback added!');
        setReports((prev) =>
          prev.map((r) => (r._id === activeReport._id ? data.report : r))
        );
        setActiveReport(null);
        setFeedbackMessage('');
      } else toast.error(data.message || 'Failed to add feedback.');
    } catch (err) {
      toast.error('Server error.');
    }
  };

  // Mark as resolved
  const handleMarkResolved = async (reportId) => {
    try {
      const res = await fetch('/api/admin/report', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, newStatus: 'resolved' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Marked as resolved!');
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? data.report : r))
        );
      } else toast.error(data.message);
    } catch {
      toast.error('Server error.');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    reviewed: 'bg-blue-100 text-blue-700 border border-blue-200',
    resolved: 'bg-green-100 text-green-700 border border-green-200',
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reported Issues</h1>

      {loading ? (
        <p className="text-gray-500 text-center mt-20">Loading reports...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">No reports found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map((report, i) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition border border-gray-100 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {report.title}
                </h3>
                <span
                  className={`px-2.5 py-0.5 text-xs rounded-full font-medium capitalize ${
                    statusColors[report.status] || 'bg-gray-100 text-gray-700 border'
                  }`}
                >
                  {report.status || 'pending'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                {report.description}
              </p>
              <p className="text-xs text-gray-400 mb-3">
                👤 {report.studentName || 'Unknown'} — 🏷️ {report.studentBatch || 'Unassigned'}
              </p>

              {report.images?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto mb-3">
                  {report.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="report"
                      className="w-16 h-16 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-80"
                    />
                  ))}
                </div>
              )}

              {report.feedback?.length > 0 && (
                <div className="bg-gray-50 border-l-4 border-[#7866FA] rounded-md p-3 mb-3">
                  {report.feedback.map((fb, idx) => (
                    <p key={idx} className="text-sm text-gray-700 mb-1">
                      💬 {fb.message}
                    </p>
                  ))}
                </div>
              )}

              <button
                onClick={() => setActiveReport(report)}
                className="w-full py-2 mt-2 bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white rounded-lg text-sm font-semibold hover:opacity-90 cursor-pointer transition"
              >
                Add Feedback
              </button>

              {report.status !== 'resolved' && (
                <button
                  onClick={() => handleMarkResolved(report._id)}
                  className="w-full py-2 mt-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition cursor-pointer"
                >
                  Mark as Resolved
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ✨ Feedback Modal */}
      <AnimatePresence>
        {activeReport && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
            >
              <button
                onClick={() => setActiveReport(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <X size={22} />
              </button>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Feedback for “{activeReport.title}”
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                👤 {activeReport.studentName || 'Unknown'} — 🏷️ {activeReport.studentBatch || 'Unassigned'}
              </p>

              <textarea
                rows={4}
                placeholder="Write feedback for this report..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#9380FD]"
              ></textarea>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
                >
                  Submit Feedback
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
