'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, CheckCircle2, Clock, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function StudentReportsPage() {
  const { user } = useUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // { [reportId]: { desc: boolean, feedback: boolean } }

  const statusStyles = {
    Resolved: 'text-green-700 bg-green-100',
    Pending: 'text-amber-700 bg-amber-100',
    'In Progress': 'text-blue-700 bg-blue-100',
  };

  const toggleExpand = (id, key) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [key]: !(prev[id]?.[key]) },
    }));
  };

  // Normalize images to array of URLs (supports strings OR {fileUrl} objects)
  const extractImageUrls = (images) => {
    if (!Array.isArray(images)) return [];
    return images
      .map((img) => (typeof img === 'string' ? img : img?.fileUrl || img?.url))
      .filter(Boolean);
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`/api/student/report/?clerkId=${user?.id}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setReports(data.reports || []);
        } else {
          toast.error(data.message || 'Failed to load reports.');
        }
      } catch (err) {
        toast.error('Server error while fetching reports.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchReports();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
        <p className="text-center text-gray-500 mt-10">Loading reports…</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reported Issues</h1>
          <p className="text-gray-600 mt-1">
            Track your submitted issues, admin feedback, and resolution status.
          </p>
        </div>

        <Link
          href="/student/report"
          
        >
          <span className='mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white rounded-lg shadow hover:opacity-90 transition flex items-center gap-2 cursor-pointer'>
            <PlusCircle size={18} /> Report New Issue
          </span>
        </Link>
      </div>

      {/* Reports Grid */}
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {reports.map((report, i) => {
            const id = report._id || String(i);
            const imgs = extractImageUrls(report.images);
            const hasMediaOrFeedback = Boolean((report.feedback && report.feedback.length > 0) || imgs.length > 0);

            const fullDesc = report.description || '';
            const showDescMore = fullDesc.length > 160;
            const descExpanded = expanded[id]?.desc;
            const descText = showDescMore && !descExpanded ? `${fullDesc.slice(0, 160)}…` : fullDesc;

            const feedbackText = typeof report.feedback === 'string' ? report.feedback : '';
            const showFeedbackMore = feedbackText.length > 180;
            const feedbackExpanded = expanded[id]?.feedback;
            const feedbackToShow =
              showFeedbackMore && !feedbackExpanded ? `${feedbackText.slice(0, 180)}…` : feedbackText;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition ${
                  hasMediaOrFeedback ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {report.title}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                      statusStyles[report.status] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {report.status || 'Pending'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-2">{descText}</p>
                {showDescMore && (
                  <button
                    onClick={() => toggleExpand(id, 'desc')}
                    className="text-xs font-medium text-[#7866FA] hover:underline"
                  >
                    {descExpanded ? 'Read less' : 'Read more'}
                  </button>
                )}

                <p className="text-xs text-gray-400 mt-2 mb-4">
                  Reported on {new Date(report.createdAt).toLocaleDateString()}
                </p>

                {/* Images (if any) */}
                {imgs.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon size={16} className="text-[#7866FA]" />
                      <span className="text-xs font-semibold text-gray-700">Screenshots</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {imgs.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                          title="Open full image"
                        >
                          {/* Use next/image for nice rounded thumbs; fallback to img if needed */}
                          <Image
                            src={url}
                            alt={`report-image-${idx}`}
                            width={120}
                            height={80}
                            className="rounded-lg border border-gray-200 object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback (single string for now; ready for threading later) */}
                {feedbackText && (
                  <div className="bg-gray-50 border-l-4 border-[#7866FA] rounded-md p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare size={14} className="text-[#7866FA]" />
                      <span className="text-xs font-semibold text-gray-700">
                        Admin Feedback
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{feedbackToShow}</p>
                    {showFeedbackMore && (
                      <button
                        onClick={() => toggleExpand(id, 'feedback')}
                        className="mt-1 text-xs font-medium text-[#7866FA] hover:underline"
                      >
                        {feedbackExpanded ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </div>
                )}

                {/* Status line */}
                <div className="flex items-center gap-2 text-sm mt-3">
                  {report.status === 'Resolved' ? (
                    <>
                      <CheckCircle2 size={16} className="text-green-600" />
                      <span className="text-green-700">Issue resolved</span>
                    </>
                  ) : (
                    <>
                      <Clock size={16} className="text-amber-500" />
                      <span className="text-amber-700">
                        {report.status === 'In Progress' ? 'In progress' : 'Awaiting response'}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-20">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reports Found</h3>
          <p className="text-gray-500 text-sm">You haven’t submitted any issues yet.</p>
        </motion.div>
      )}
    </div>
  );
}
