'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Image as ImageIcon,
  UserCircle,
} from 'lucide-react';

export default function StudentReportsPage() {
  const { user, isLoaded } = useUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  // 🎨 Status color mapping (consistent with admin)
  const statusStyles = {
    pending: 'text-amber-700 bg-amber-100 border border-amber-200',
    reviewed: 'text-blue-700 bg-blue-100 border border-blue-200',
    resolved: 'text-green-700 bg-green-100 border border-green-200',
  };

  // 🔄 Expand toggle
  const toggleExpand = (id, key) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [key]: !prev[id]?.[key] },
    }));
  };

  // 🖼 Normalize image URLs
  const extractImageUrls = (images) => {
    if (!Array.isArray(images)) return [];
    return images
      .map((img) => (typeof img === 'string' ? img : img?.fileUrl || img?.url))
      .filter(Boolean);
  };

  // 🧠 Fetch Reports
  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    const fetchReports = async () => {
      try {
        const res = await fetch(`/api/student/report?clerkId=${user.id}`, {
          cache: 'no-store',
        });
        const data = await res.json();

        if (data.success) setReports(data.reports || []);
        else toast.error(data.message || 'Failed to load reports.');
      } catch (err) {
        toast.error('Server error while fetching reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [isLoaded, user?.id]);

  // 🕒 Loading State
  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-center animate-pulse">
          Loading your reports…
        </p>
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
            View your submitted reports, screenshots, and admin feedback in real-time.
          </p>
        </div>

        <Link href="/student/report">
          <span className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white rounded-lg shadow hover:opacity-90 transition flex items-center gap-2 cursor-pointer">
            <PlusCircle size={18} /> Report New Issue
          </span>
        </Link>
      </div>

      {/* Reports */}
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.map((report, i) => {
            const id = report._id || String(i);
            const imgs = extractImageUrls(report.images);
            const feedbackList = Array.isArray(report.feedback)
              ? report.feedback
              : [];

            // 📝 Description
            const fullDesc = report.description || '';
            const descExpanded = expanded[id]?.desc;
            const descTruncated =
              fullDesc.length > 160 && !descExpanded
                ? `${fullDesc.slice(0, 160)}…`
                : fullDesc;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-200"
              >
                {/* Top Section */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.title}
                    </h3>
                    {report.studentBatch && (
                      <p className="text-xs text-gray-500">
                        Batch: <span className="font-medium">{report.studentBatch}</span>
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-xs rounded-full font-medium capitalize ${statusStyles[report.status] || 'bg-gray-100 text-gray-700 border border-gray-200'}`}
                  >
                    {report.status || 'pending'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-2">{descTruncated}</p>
                {fullDesc.length > 160 && (
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

                {/* Images */}
                {imgs.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon size={16} className="text-[#7866FA]" />
                      <span className="text-xs font-semibold text-gray-700">
                        Screenshots
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {imgs.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open full image"
                        >
                          <Image
                            src={url}
                            alt={`report-image-${idx}`}
                            width={110}
                            height={80}
                            loading="lazy"
                            className="rounded-lg border border-gray-200 object-cover hover:opacity-90"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {feedbackList.length > 0 && (
                  <div className="bg-gray-50 border-l-4 border-[#7866FA] rounded-md p-3 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={14} className="text-[#7866FA]" />
                      <span className="text-xs font-semibold text-gray-700">
                        Admin Feedback
                      </span>
                    </div>
                    <div className="space-y-2">
                      {feedbackList.map((fb, idx) => (
                        <div key={idx} className="text-sm text-gray-700">
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5">
                            <UserCircle size={12} />
                            {new Date(fb.createdAt).toLocaleString()}
                          </div>
                          <p>{fb.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Summary */}
                <div className="flex items-center gap-2 text-sm mt-3">
                  {report.status === 'resolved' ? (
                    <>
                      <CheckCircle2 size={16} className="text-green-600" />
                      <span className="text-green-700 font-medium">
                        Issue resolved
                      </span>
                    </>
                  ) : report.status === 'reviewed' ? (
                    <>
                      <Clock size={16} className="text-blue-600" />
                      <span className="text-blue-700 font-medium">
                        Under review
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock size={16} className="text-amber-500" />
                      <span className="text-amber-700 font-medium">
                        Awaiting admin response
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-20"
        >
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Reports Found
          </h3>
          <p className="text-gray-500 text-sm">
            You haven’t submitted any issues yet.
          </p>
        </motion.div>
      )}
    </div>
  );
}
