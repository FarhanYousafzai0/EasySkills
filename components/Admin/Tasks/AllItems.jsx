'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search, MoreVertical, Edit2, Trash2, Layers, Calendar, Video, ClipboardList, Hash
} from 'lucide-react';

const batches = ['All', 'Batch 1', 'Batch 2', 'Batch 3'];
const types = ['All', 'Task', 'Live'];

export default function AllItems() {
  // Ensure the default value is always an array, and set only via setItems from here
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [batch, setBatch] = useState('All');
  const [type, setType] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all items from backend
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/alltask&live');
      const data = await res.json();
      // Make sure data.items is always an array (or fallback to empty)
      if (res.ok && data.success) setItems(Array.isArray(data.items) ? data.items : []);
      else throw new Error(data.message || 'Failed to load data');
    } catch (err) {
      toast.error(err.message);
      setItems([]); // On error, items is always an array
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete item (task or live)
  const handleDelete = async (id, kind) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const url =
        kind === 'task'
          ? `/api/admin/tasks/${id}`
          : `/api/admin/livesessions/${id}`;

      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`${kind === 'task' ? 'Task' : 'Live Session'} deleted!`);
        setItems((prev) => Array.isArray(prev) ? prev.filter((i) => i._id !== id) : []);
      } else throw new Error(data.message || 'Failed to delete');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ✅ Update item status (quick example)
  const handleUpdateStatus = async (id, kind, newStatus) => {
    try {
      const url =
        kind === 'task'
          ? `/api/admin/tasks/${id}`
          : `/api/admin/livesessions/${id}`;

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`${kind} status updated to "${newStatus}"`);
        fetchItems(); // refresh list
      } else throw new Error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ✅ Filtering & Search
  const filtered = useMemo(() => {
    // Defensive: items is always an array, but just in case
    const safeItems = Array.isArray(items) ? items : [];
    return safeItems.filter((it) => {
      const q = query.toLowerCase();
      const matchesQ =
        (it.kind === 'task' && it.title?.toLowerCase().includes(q)) ||
        (it.kind === 'live' && it.topic?.toLowerCase().includes(q)) ||
        it._id?.toLowerCase().includes(q);

      const matchesType =
        type === 'All' ||
        (type === 'Task' && it.kind === 'task') ||
        (type === 'Live' && it.kind === 'live');

      const matchesBatch =
        batch === 'All' ||
        (it.kind === 'task' && it.batches?.includes(batch)) ||
        (it.kind === 'live' && it.batch === batch);

      return matchesQ && matchesType && matchesBatch;
    });
  }, [items, query, batch, type]);

  const total = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 bg-white/70 backdrop-blur-lg border border-gray-200/50 shadow-md rounded-2xl"
    >
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList className="text-[#9380FD]" /> All Tasks & Live Sessions
        </h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search className="text-gray-500 mr-2" size={18} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title/topic/id..."
              className="bg-transparent outline-none text-sm w-48"
            />
          </div>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="bg-gray-100 rounded-lg px-3 py-2 text-sm"
          >
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            value={batch}
            onChange={(e) => {
              setBatch(e.target.value);
              setPage(1);
            }}
            className="bg-gray-100 rounded-lg px-3 py-2 text-sm"
          >
            {batches.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence>
        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 py-8"
          >
            Loading items...
          </motion.p>
        ) : paginated.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 py-8"
          >
            Nothing here yet with current filters.
          </motion.p>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {paginated.map((it) => (
              <motion.div
                key={it._id}
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono">{it._id}</span>
                  </div>
                  <div className="relative group cursor-pointer">
                    <MoreVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    <div className="absolute hidden group-hover:block top-6 right-0 bg-white shadow-md border border-gray-100 rounded-lg text-sm z-10">
                      <button
                        onClick={() =>
                          handleUpdateStatus(it._id, it.kind, it.status === 'active' ? 'completed' : 'active')
                        }
                        className="px-4 py-2 hover:bg-gray-50 w-full text-left flex items-center gap-2"
                      >
                        <Edit2 size={14} /> Toggle Status
                      </button>
                      <button
                        onClick={() => handleDelete(it._id, it.kind)}
                        className="px-4 py-2 hover:bg-gray-50 w-full text-left flex items-center gap-2 text-red-600"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>

                {it.kind === 'task' ? (
                  <>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                      {it.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Due: {new Date(it.dueDate).toLocaleDateString()}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        Task
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                        <Layers className="h-3 w-3" /> {it.batches?.join(', ')}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 capitalize">
                        {it.status}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Video className="h-5 w-5 text-[#9380FD]" /> {it.topic}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />{' '}
                      {new Date(it.date).toLocaleDateString()} — {it.time}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                        Live
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                        <Layers className="h-3 w-3" /> {it.batch}
                      </span>
                      {it.recurringWeekly && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                          Weekly
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700 capitalize">
                        {it.status}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {total > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {total}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(total, p + 1))}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            disabled={page === total}
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
}
