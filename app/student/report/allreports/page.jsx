'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PlusCircle, CheckCircle2, Clock } from 'lucide-react';

export default function StudentReportsPage() {
  const [reports] = useState([
    {
      id: 1,
      title: 'Unable to upload task file',
      category: 'Submission Error',
      status: 'Resolved',
      date: '2025-10-10',
    },
    {
      id: 2,
      title: 'Live session link expired',
      category: 'Live Session',
      status: 'Pending',
      date: '2025-10-12',
    },
    {
      id: 3,
      title: 'Dashboard not loading on mobile',
      category: 'Website Bug',
      status: 'Resolved',
      date: '2025-10-08',
    },
  ]);

  const statusStyles = {
    Resolved: 'text-green-600 bg-green-100',
    Pending: 'text-yellow-600 bg-yellow-100',
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reported Issues</h1>
          <p className="text-gray-600 mt-1">
            Here you can track the progress of all issues you’ve reported.
          </p>
        </div>

        <Link
          href="/student/report/new"
          className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white rounded-lg shadow hover:opacity-90 transition flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle size={18} /> Report New Issue
        </Link>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {report.title}
              </h3>
              <span
                className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${statusStyles[report.status]}`}
              >
                {report.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-2">{report.category}</p>
            <p className="text-xs text-gray-400 mb-3">
              Reported on {report.date}
            </p>

            <div className="flex items-center gap-2 text-sm">
              {report.status === 'Resolved' ? (
                <>
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-green-600">Issue resolved</span>
                </>
              ) : (
                <>
                  <Clock size={16} className="text-yellow-500" />
                  <span className="text-yellow-600">Awaiting response</span>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {reports.length === 0 && (
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
