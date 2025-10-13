'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageSquare } from 'lucide-react';

export default function SubmittedTasksPage() {
  const submitted = [
    {
      title: 'React Components 101',
      submittedAt: '2025-10-10',
      feedback: 'Well structured, minor improvements needed.',
      grade: 'A-',
    },
    {
      title: 'Next.js Routing',
      submittedAt: '2025-10-12',
      feedback: 'Excellent routing logic, keep it up!',
      grade: 'A+',
    },
  ];

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Submitted Tasks</h1>
      <p className="text-gray-600 mb-6">View your past submissions and feedback.</p>

      <div className="grid gap-6">
        {submitted.map((task, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                {task.title}
              </h3>
              <span className="text-xs text-gray-500">{task.submittedAt}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{task.feedback}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-semibold text-[#7866FA]">
                Grade: {task.grade}
              </span>
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#7866FA] transition">
                <MessageSquare size={16} /> Request Review
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
