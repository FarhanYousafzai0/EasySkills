'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Clock, CheckCircle, ClipboardList, Award, RefreshCcw } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function AllTasksPage() {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🧠 Fetch function (reusable)
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const batch = user?.publicMetadata?.batch;
    if (!batch) {
      toast.error('No batch assigned to your account.');
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const res = await fetch(`/api/student/tasks?batch=${batch}&clerkId=${user.id}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Server error fetching tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // ⚡ Initial load
  useEffect(() => {
    if (user) fetchTasks();
  }, [user, fetchTasks]);

  // 🪄 Listen for localStorage updates (cross-tab or submit page)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'taskUpdated') {
        fetchTasks();
        localStorage.removeItem('taskUpdated'); // clear flag
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [fetchTasks]);

  // 📊 Stats
  const graded = tasks.filter((t) => t.status === 'graded').length;
  const submitted = tasks.filter((t) => t.status === 'submitted').length;
  const total = tasks.length;
  const pending = total - submitted - graded;

  const cardBase =
    'bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-between cursor-pointer';

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">Track your assigned tasks, submissions, and grades.</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchTasks}
          disabled={refreshing}
          className="flex items-center gap-2 bg-[#7866FA] text-white text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-[#6c5ae9] transition disabled:opacity-60"
        >
          <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <motion.div whileHover={{ scale: 1.03 }} className={cardBase}>
          <div>
            <p className="text-gray-500 text-sm mb-1">Graded Tasks</p>
            <h2 className="text-3xl font-bold text-[#7866FA] flex items-center gap-2">
              <CountUp end={graded} duration={1.2} />
            </h2>
          </div>
          <div className="p-3 rounded-xl bg-green-100">
            <Award size={26} className="text-green-600" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} className={cardBase}>
          <div>
            <p className="text-gray-500 text-sm mb-1">Submitted Tasks</p>
            <h2 className="text-3xl font-bold text-[#7866FA] flex items-center gap-2">
              <CountUp end={submitted} duration={1.2} />
            </h2>
          </div>
          <div className="p-3 rounded-xl bg-[#9380FD]/10">
            <CheckCircle size={26} className="text-[#7866FA]" />
          </div>
        </motion.div>

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
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No tasks assigned.</p>
      ) : (
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
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <motion.tr
                    key={task._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium">{task.title}</td>
                    <td className="py-3 px-4">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{task.priority}</td>

                    <td className="py-3 px-4 capitalize">
                      {task.status === 'graded' ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle size={14} /> Graded
                        </span>
                      ) : task.status === 'submitted' ? (
                        <span className="flex items-center gap-1 text-[#7866FA] font-medium">
                          <Clock size={14} /> Submitted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {task.score !== null ? `${task.score}` : '-'}
                    </td>

                    <td className="py-3 px-4">
                      {task.status === 'graded' ? (
                        <span className="text-green-600 font-medium">Completed</span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                          className={`text-sm px-3 py-1.5 rounded-md cursor-pointer text-white shadow-sm ${
                            task.status === 'submitted'
                              ? 'bg-[#7866FA]'
                              : 'bg-gradient-to-r from-[#9380FD] to-[#7866FA]'
                          }`}
                          onClick={() => {
                            // 👇 Save signal to refresh automatically after submission
                            localStorage.setItem('taskUpdated', Date.now().toString());
                            window.location.href = `/student/task/submit?taskId=${task._id}`;
                          }}
                        >
                          {task.status === 'submitted' ? 'View' : 'Submit'}
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
