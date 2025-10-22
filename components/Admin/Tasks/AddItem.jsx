'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calendar, Clock3, Tag, Layers, Plus, Repeat, Video, FileText
} from 'lucide-react';

const batches = ['Batch 1', 'Batch 2', 'Batch 3'];
const priorities = ['Low', 'Medium', 'High'];

export default function AddItem() {
  const [type, setType] = useState('task'); // 'task' | 'live'
  const [loading, setLoading] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', dueDate: '',
    priority: 'Medium', tags: '', batches: [],
  });

  const [liveForm, setLiveForm] = useState({
    topic: '', batch: '', date: '', time: '',
    recurringWeekly: false, meetingLink: '', notes: '',
  });

  // ✅ Set default date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTaskForm((p) => ({ ...p, dueDate: p.dueDate || today }));
    setLiveForm((p) => ({ ...p, date: p.date || today }));
  }, []);

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'task') {
        // -------- TASK PAYLOAD --------
        const payload = {
          kind: 'task',
          title: taskForm.title,
          description: taskForm.description,
          dueDate: taskForm.dueDate,
          priority: taskForm.priority,
          tags: taskForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
          batches: taskForm.batches,
          status: 'active',
        };

        const res = await fetch('/api/admin/add-tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success('✅ Task added successfully!');
          setTaskForm({ title: '', description: '', dueDate: '', priority: 'Medium', tags: '', batches: [] });
        } else throw new Error(data.message || 'Failed to add task.');

      } else {
        // -------- LIVE SESSION PAYLOAD --------
        const basePayload = {
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

        // if repeat weekly — create 4 sessions spaced one week apart
        const sessions = [basePayload];
        if (liveForm.recurringWeekly) {
          for (let i = 1; i <= 4; i++) {
            const d = new Date(liveForm.date);
            d.setDate(d.getDate() + 7 * i);
            sessions.push({ ...basePayload, date: d.toISOString().split('T')[0] });
          }
        }

        // call backend for each session
        const promises = sessions.map((s) =>
          fetch('/api/admin/add-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(s),
          })
        );

        const responses = await Promise.all(promises);
        const allOK = responses.every((r) => r.ok);
        if (allOK) toast.success(`✅ ${sessions.length} Live Session${sessions.length > 1 ? 's' : ''} created!`);
        else toast.error('Some sessions failed to create.');

        setLiveForm({
          topic: '', batch: '', date: '', time: '',
          recurringWeekly: false, meetingLink: '', notes: ''
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UI
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

        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setType('task')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${type === 'task'
              ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white'
              : 'text-gray-700'
              }`}
          >
            Task
          </button>
          <button
            onClick={() => setType('live')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${type === 'live'
              ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white'
              : 'text-gray-700'
              }`}
          >
            Live Session
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="wait">
          {type === 'task' && (
            <TaskForm taskForm={taskForm} setTaskForm={setTaskForm} />
          )}
          {type === 'live' && (
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

/* -------------------------------------- */
/* TASK FORM                              */
/* -------------------------------------- */
function TaskForm({ taskForm, setTaskForm }) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Title</label>
        <input
          value={taskForm.title}
          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
          placeholder="e.g., Week 2: ML Worksheet"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#9380FD]" /> Due Date
        </label>
        <input
          type="date"
          value={taskForm.dueDate}
          onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea
          rows="3"
          value={taskForm.description}
          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
          placeholder="Describe the task, requirements, resources..."
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Priority</label>
        <select
          value={taskForm.priority}
          onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:border-[#9380FD]"
        >
          {priorities.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1 flex items-center gap-1">
          <Tag className="h-4 w-4 text-[#9380FD]" /> Tags
        </label>
        <input
          value={taskForm.tags}
          onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
          placeholder="ml, worksheet, supervised"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#9380FD]" /> Assign to Batches
        </label>
        <div className="flex flex-wrap gap-2">
          {batches.map((b) => {
            const active = taskForm.batches.includes(b);
            return (
              <button
                type="button"
                key={b}
                onClick={() => {
                  setTaskForm((prev) => {
                    const set = new Set(prev.batches);
                    active ? set.delete(b) : set.add(b);
                    return { ...prev, batches: [...set] };
                  });
                }}
                className={`px-3 py-1 rounded-lg text-sm border ${active
                  ? 'border-transparent bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------- */
/* LIVE SESSION FORM                      */
/* -------------------------------------- */
function LiveForm({ liveForm, setLiveForm }) {
  return (
    <>
      <div>
        <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">
          <Video className="h-4 w-4 text-[#9380FD]" /> Topic
        </label>
        <input
          value={liveForm.topic}
          onChange={(e) => setLiveForm({ ...liveForm, topic: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
          placeholder="e.g., CNNs & Transfer Learning"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Batch</label>
        <select
          value={liveForm.batch}
          onChange={(e) => setLiveForm({ ...liveForm, batch: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:border-[#9380FD]"
        >
          <option value="">Select Batch</option>
          {batches.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#9380FD]" /> Date
        </label>
        <input
          type="date"
          value={liveForm.date}
          onChange={(e) => setLiveForm({ ...liveForm, date: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-[#9380FD]" /> Time
        </label>
        <input
          type="time"
          value={liveForm.time}
          onChange={(e) => setLiveForm({ ...liveForm, time: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Meeting Link</label>
        <input
          value={liveForm.meetingLink}
          onChange={(e) => setLiveForm({ ...liveForm, meetingLink: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
          placeholder="Zoom/Meet link"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="recurring"
          type="checkbox"
          checked={liveForm.recurringWeekly}
          onChange={(e) => setLiveForm({ ...liveForm, recurringWeekly: e.target.checked })}
          className="h-4 w-4 accent-[#7866FA]"
        />
        <label htmlFor="recurring" className="text-sm text-gray-700 flex items-center gap-2">
          <Repeat className="h-4 w-4 text-[#9380FD]" />
          Repeat Weekly (auto-generate upcoming sessions)
        </label>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm text-gray-700 mb-1 flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#9380FD]" /> Notes (optional)
        </label>
        <textarea
          rows="3"
          value={liveForm.notes}
          onChange={(e) => setLiveForm({ ...liveForm, notes: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
          placeholder="Add agenda, resources, or next week plan..."
        />
      </div>
    </>
  );
}
