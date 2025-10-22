'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import {
  Calendar, Clock3, Tag, Layers, Plus, Repeat, Video, FileText
} from 'lucide-react';

const batches = ['Batch 1', 'Batch 2', 'Batch 3'];
const priorities = ['Low', 'Medium', 'High'];

export default function AddItem({ onAdd }) {
  const [type, setType] = useState('task');
  const [loading, setLoading] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', dueDate: '',
    priority: 'Medium', tags: '', batches: [],
  });

  const [liveForm, setLiveForm] = useState({
    topic: '', batch: '', date: '', time: '',
    recurringWeekly: false, meetingLink: '', notes: '',
  });

  // Default date setup
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTaskForm((p) => ({ ...p, dueDate: p.dueDate || today }));
    setLiveForm((p) => ({ ...p, date: p.date || today }));
  }, []);

  // 🧠 Handle Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload =
      type === 'task'
        ? {
            kind: 'task',
            title: taskForm.title,
            description: taskForm.description,
            dueDate: taskForm.dueDate,
            priority: taskForm.priority,
            tags: taskForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
            batches: taskForm.batches,
            status: 'active',
          }
        : {
            kind: 'live',
            topic: liveForm.topic,
            batch: liveForm.batch,
            date: liveForm.date,
            time: liveForm.time,
            recurringWeekly: liveForm.recurringWeekly,
            meetingLink: liveForm.meetingLink,
            notes: liveForm.notes,
            status: 'scheduled',
          };

    try {
      const res = await fetch('http://localhost:3000/api/admin/add-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`${data.type === 'task' ? 'Task' : 'Live Session'} created successfully!`);
        onAdd?.(data.data);

        // Reset form
        setTaskForm({ title: '', description: '', dueDate: '', priority: 'Medium', tags: '', batches: [] });
        setLiveForm({ topic: '', batch: '', date: '', time: '', recurringWeekly: false, meetingLink: '', notes: '' });
      } else {
        throw new Error(data.message || 'Something went wrong.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 bg-white/70 backdrop-blur-lg border border-gray-200/50 shadow-md rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Plus className="text-[#9380FD]" /> Add Task / Live Session
        </h2>

        {/* Type Switch */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          {['task', 'live'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                type === t
                  ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white'
                  : 'text-gray-700'
              }`}
            >
              {t === 'task' ? 'Task' : 'Live Session'}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="wait">
          {type === 'task' ? (
            <TaskForm taskForm={taskForm} setTaskForm={setTaskForm} />
          ) : (
            <LiveForm liveForm={liveForm} setLiveForm={setLiveForm} />
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white px-8 py-2 rounded-lg font-semibold shadow-md"
          >
            {loading ? 'Saving…' : 'Save'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

// 🧩 Task Form Component
function TaskForm({ taskForm, setTaskForm }) {
  return (
    <>
      <input
        placeholder="Title"
        value={taskForm.title}
        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
        className="border rounded-lg px-4 py-2 w-full"
      />
      <input
        type="date"
        value={taskForm.dueDate}
        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
        className="border rounded-lg px-4 py-2 w-full"
      />
      <textarea
        rows="3"
        placeholder="Description"
        value={taskForm.description}
        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
        className="border rounded-lg px-4 py-2 w-full"
      />
      <input
        placeholder="Tags (comma-separated)"
        value={taskForm.tags}
        onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
        className="border rounded-lg px-4 py-2 w-full"
      />
    </>
  );
}

// 🧩 Live Form Component
function LiveForm({ liveForm, setLiveForm }) {
  return (
    <>
      <input
        placeholder="Topic"
        value={liveForm.topic}
        onChange={(e) => setLiveForm({ ...liveForm, topic: e.target.value })}
        className="border rounded-lg px-4 py-2 w-full"
      />
      <input
        type="date"
        value={liveForm.date}
        onChange={(e) => setLiveForm({ ...liveForm, date: e.target.value })}
        className="border rounded-lg px-4 py-2 w-full"
      />
      <input
        type="time"
        value={liveForm.time}
        onChange={(e) => setLiveForm({ ...liveForm, time: e.target.value })}
        className="border rounded-lg px-4 py-2 w-full"
      />
      <input
        placeholder="Meeting Link"
        value={liveForm.meetingLink}
        onChange={(e) => setLiveForm({ ...liveForm, meetingLink: e.target.value })}
        className="border rounded-lg px-4 py-2 w-full"
      />
    </>
  );
}
