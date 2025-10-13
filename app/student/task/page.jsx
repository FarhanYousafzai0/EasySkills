'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Clock, CheckCircle, AlertCircle, ClipboardList } from 'lucide-react';

export default function AllTasksPage() {
  const [tasks] = useState([
    {
      id: 'T1',
      title: 'React Components 101',
      dueDate: '2025-10-18',
      status: 'Pending',
    },
    {
      id: 'T2',
      title: 'Next.js Routing',
      dueDate: '2025-10-12',
      status: 'Submitted',
    },
    {
      id: 'T3',
      title: 'JavaScript Fundamentals',
      dueDate: '2025-10-20',
      status: 'Overdue',
    },
  ]);

  const completed = tasks.filter((t) => t.status === 'Submitted').length;
  const total = tasks.length;
  const pending = total - completed;

  const cardBase =
    'bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-between cursor-pointer';

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Tasks</h1>
      <p className="text-gray-600 mb-8">
        Track your assigned tasks, deadlines, and submission status.
      </p>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {/* Completed */}
        <motion.div whileHover={{ scale: 1.03 }} className={cardBase}>
          <div>
            <p className="text-gray-500 text-sm mb-1">Completed Tasks</p>
            <h2 className="text-3xl font-bold text-[#7866FA] flex items-center gap-2">
              <CountUp end={completed} duration={1.2} /> 
            </h2>
          </div>
          <div className="p-3 rounded-xl bg-green-100">
            <CheckCircle size={26} className="text-green-600" />
          </div>
        </motion.div>

        {/* Pending */}
        <motion.div whileHover={{ scale: 1.03 }} className={cardBase}>
          <div>
            <p className="text-gray-500 text-sm mb-1">Pending Tasks</p>
            <h2 className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
              <CountUp end={pending} duration={1.2} />
            </h2>
          </div>
          <div className="p-3 rounded-xl bg-yellow-100">
            <Clock size={26} className="text-yellow-500" />
          </div>
        </motion.div>

        {/* Total */}
        <motion.div whileHover={{ scale: 1.03 }} className={cardBase}>
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Tasks</p>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <CountUp end={total} duration={1.2} />
            </h2>
          </div>
          <div className="p-3 rounded-xl bg-[#9380FD]/10">
            <ClipboardList size={26} className="text-[#7866FA]" />
          </div>
        </motion.div>
      </div>

      {/* Tasks Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardList size={20} className="text-[#7866FA]" /> Assigned Tasks
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 border-collapse">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Title</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium">{task.title}</td>
                  <td className="py-3 px-4">{task.dueDate}</td>
                  <td className="py-3 px-4">
                    {task.status === 'Pending' && (
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                    {task.status === 'Submitted' && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={14} /> Submitted
                      </span>
                    )}
                    {task.status === 'Overdue' && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertCircle size={14} /> Overdue
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="text-sm px-3 py-1.5 rounded-md text-white bg-gradient-to-r from-[#9380FD] to-[#7866FA] hover:opacity-90 cursor-pointer shadow-sm"
                      onClick={() => (window.location.href = '/student/tasks/submit')}
                    >
                      {task.status === 'Submitted' ? 'View' : 'Submit'}
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
