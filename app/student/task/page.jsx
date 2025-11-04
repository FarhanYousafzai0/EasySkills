'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Clock, CheckCircle, ClipboardList } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function AllTasksPage() {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch tasks for student's batch
  useEffect(() => {
    if (!user) return;
    const batch = user?.publicMetadata?.batch;
    if (!batch) {
      toast.error('No batch assigned to your account.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/student/tasks?batch=${batch}&clerkId=${user.id}`, { cache: 'no-store' });

        const data = await res.json();
        if (data.success) setTasks(data.data);
        else toast.error(data.message);
      } catch {
        toast.error('Server error fetching tasks.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // 📊 Stats
  const completed = tasks.filter((t) => t.status === 'completed').length;
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
                      {task.status === 'completed' ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={14} /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        className={`text-sm px-3 py-1.5 rounded-md cursor-pointer text-white shadow-sm ${
                          task.status === 'completed'
                            ? 'bg-green-500'
                            : 'bg-gradient-to-r from-[#9380FD] to-[#7866FA]'
                        }`}
                        onClick={() =>
                          task.status === 'completed'
                            ? null
                            : (window.location.href = `/student/task/submit?taskId=${task._id}`)
                        }
                      >
                        {task.status === 'completed' ? 'View' : 'Submit'}
                      </motion.button>
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
