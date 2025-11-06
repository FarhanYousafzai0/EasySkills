'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calendar, Clock3, Tag, Layers, Plus, Repeat, Video, FileText,
  Loader2,
  PlusIcon
} from 'lucide-react';
import { MutatingDots } from 'react-loader-spinner';

const priorities = ['Low', 'Medium', 'High'];

export default function AddItem() {
  const [type, setType] = useState('task');
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(true);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    tags: '',
    batches: [],
  });

  const [liveForm, setLiveForm] = useState({
    topic: '',
    batch: '',
    date: '',
    time: '',
    recurringWeekly: false,
    meetingLink: '',
    notes: '',
  });

  // ✅ Fetch batches
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/batches', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setBatches(data.data);
        } else {
          toast.error('Failed to load batches');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching batches');
      } finally {
        setBatchLoading(false);
      }
    })();
  }, []);

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
          toast.success(' Task added successfully!');
          setTaskForm({
            title: '',
            description: '',
            dueDate: new Date().toISOString().split('T')[0],
            priority: 'Medium',
            tags: '',
            batches: [],
          });
        } else throw new Error(data.message || 'Failed to add task.');
      } else {
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

        const sessions = [basePayload];
        if (liveForm.recurringWeekly) {
          for (let i = 1; i <= 4; i++) {
            const d = new Date(liveForm.date);
            d.setDate(d.getDate() + 7 * i);
            sessions.push({ ...basePayload, date: d.toISOString().split('T')[0] });
          }
        }

        const results = await Promise.all(
          sessions.map((s) =>
            fetch('/api/admin/add-tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(s),
            })
          )
        );

        const allOK = results.every((r) => r.ok);
        if (allOK) toast.success(` ${sessions.length} Live Session(s) created!`);
        else toast.error('Some sessions failed to create.');

        setLiveForm({
          topic: '',
          batch: '',
          date: new Date().toISOString().split('T')[0],
          time: '',
          recurringWeekly: false,
          meetingLink: '',
          notes: '',
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save.');
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Plus className="text-[#9380FD]" /> Add Task / Live Session
        </h2>
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          {['task', 'live'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium ${
                type === t
                  ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t === 'task' ? 'Task' : 'Live Session'}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="wait">
          {type === 'task' && (
            <TaskForm
              taskForm={taskForm}
              setTaskForm={setTaskForm}
              batches={batches}
              batchLoading={batchLoading}
            />
          )}
          {type === 'live' && (
            <LiveForm
              liveForm={liveForm}
              setLiveForm={setLiveForm}
              batches={batches}
              batchLoading={batchLoading}
            />
          )}
        </AnimatePresence>

        <div className="md:col-span-2 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="bg-gradient-to-r cursor-pointer from-[#9380FD] to-[#7866FA] text-white px-8 py-2 rounded-lg font-semibold shadow-md"
          >
            {loading ? (
             <Loader2 className="animate-spin" />
            ) : (
              'Save'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

function TaskForm({ taskForm, setTaskForm, batches, batchLoading }) {
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
          placeholder="Describe the task..."
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Priority</label>
        <select
          value={taskForm.priority}
          onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:border-[#9380FD]"
        >
          {priorities.map((p) => (
            <option key={p}>{p}</option>
          ))}
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
        {batchLoading ? (
          <p className="text-gray-400 text-sm">Loading batches...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
          {batches.map((b) => {
  const active = taskForm.batches.includes(b.title);
  return (
    <button
      type="button"
      key={b._id}
      onClick={() => {
        setTaskForm((prev) => {
          const set = new Set(prev.batches);
          active ? set.delete(b.title) : set.add(b.title);
          return { ...prev, batches: [...set] };
        });
      }}
      className={`px-3 py-1 rounded-lg text-sm border cursor-pointer ${
        active
          ? 'border-transparent bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white'
          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
      }`}
    >
      {b.title}
    </button>
  );
})}

          </div>
        )}
      </div>
    </>
  );
}

function LiveForm({ liveForm, setLiveForm, batches, batchLoading }) {
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
          {batchLoading
            ? <option>Loading...</option>
            : batches.map((b) => <option key={b._id}>{b.title}</option>)}
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
          className="w-full border  border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Meeting Link</label>
        <input
        type="url"
          value={liveForm.meetingLink}
          onChange={(e) => setLiveForm({ ...liveForm, meetingLink: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#9380FD]"
          placeholder="https://meet.google.com/abc123"
        />
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
