'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Layers, Calendar, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { toast } from 'sonner';

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return '';
  }
}

export default function AllBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBatch, setEditBatch] = useState(null);
  const [editRange, setEditRange] = useState();

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/batches', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to fetch batches.');
      setBatches(data.data || []);
    } catch (err) {
      toast.error(err.message || 'Error loading batches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const openEdit = (batch) => {
    setEditBatch({
      _id: batch._id,
      title: batch.title || '',
      description: batch.description || '',
      startDate: batch.startDate,
      endDate: batch.endDate,
    });
    setEditRange({
      from: batch.startDate ? new Date(batch.startDate) : undefined,
      to: batch.endDate ? new Date(batch.endDate) : undefined,
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editBatch?.title || !editRange?.from || !editRange?.to) {
      toast.error('Title and date range are required.');
      return;
    }
    try {
      setEditing(true);
      const res = await fetch(`/api/admin/batches/${editBatch._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editBatch.title,
          description: editBatch.description,
          startDate: editRange.from.toISOString(),
          endDate: editRange.to.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to update batch.');

      setBatches((prev) => prev.map((b) => (b._id === editBatch._id ? data.data : b)));
      toast.success('Batch updated successfully');
      setEditOpen(false);
      setEditBatch(null);
      setEditRange(undefined);
    } catch (err) {
      toast.error(err.message || 'Error updating batch.');
    } finally {
      setEditing(false);
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/batches/${deletingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to delete batch.');

      setBatches((prev) => prev.filter((b) => b._id !== deletingId));
      toast.success('Batch deleted');
      setDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err.message || 'Error deleting batch.');
    } finally {
      setDeleting(false);
    }
  };

  const countText = useMemo(() => {
    if (loading) return 'Loading…';
    return `Showing ${batches.length} batch${batches.length === 1 ? '' : 'es'}`;
  }, [batches.length, loading]);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-white shadow-md rounded-2xl p-6 md:p-10 mt-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h2 className="text-2xl md:text-3xl font-bold cursor-pointer text-gray-800 flex items-center gap-2">
            <Layers className="text-[#9380FD]" size={24} /> All Batches
          </h2>
        <p className="text-sm text-gray-500">{countText}</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl border border-gray-200 p-5 bg-gray-50 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && batches.length === 0 && (
          <div className="text-center text-gray-500 py-10">No batches found.</div>
        )}

        {/* Grid */}
        {!loading && batches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <motion.div
                key={batch._id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-gray-200 p-5 bg-gray-50 hover:shadow-xl hover:border-[#9380FD]/40 transition-all duration-300 relative group cursor-pointer"
              >
                {/* Title & Description */}
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{batch.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{batch.description}</p>

                {/* Dates */}
                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <p>
                    <span className="font-medium text-gray-700">Start:</span> {formatDate(batch.startDate)}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">End:</span> {formatDate(batch.endDate)}
                  </p>
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => openEdit(batch)}
                    className="p-2 rounded-md bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md hover:opacity-90"
                  >
                    <Edit size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => confirmDelete(batch._id)}
                    className="p-2 rounded-md bg-red-500 text-white shadow-md hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* EDIT MODAL (custom, no ShadCN) */}
      {editOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!editing) {
                setEditOpen(false);
                setEditBatch(null);
                setEditRange(undefined);
              }
            }}
          />
          {/* Modal */}
          <div className="relative z-[61] w-full max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Edit size={18} /> Edit Batch
              </h3>
              <button
                className="p-2 rounded-md hover:bg-gray-100"
                onClick={() => {
                  if (!editing) {
                    setEditOpen(false);
                    setEditBatch(null);
                    setEditRange(undefined);
                  }
                }}
              >
                <X size={18} />
              </button>
            </div>

            {editBatch && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={editBatch.title}
                    onChange={(e) => setEditBatch((b) => ({ ...b, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#9380FD]"
                  />

                  <label className="block text-sm font-semibold text-gray-700 mt-4 mb-1">Description</label>
                  <textarea
                    rows={5}
                    value={editBatch.description}
                    onChange={(e) => setEditBatch((b) => ({ ...b, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#9380FD]"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="text-[#9380FD]" size={18} />
                    <h4 className="text-gray-800 font-semibold text-sm">Select Batch Duration *</h4>
                  </div>

                  <DayPicker
                    mode="range"
                    selected={editRange}
                    onSelect={setEditRange}
                    className="text-gray-700 rounded-lg"
                    modifiersClassNames={{
                      selected: 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white',
                      today: 'font-semibold text-[#7866FA]',
                    }}
                  />

                  {editRange?.from && (
                    <div className="mt-3 text-xs text-gray-600">
                      <p>
                        Start:{' '}
                        <span className="font-medium text-gray-800">
                          {editRange.from.toDateString()}
                        </span>
                      </p>
                      {editRange?.to && (
                        <p>
                          End:{' '}
                          <span className="font-medium text-gray-800">
                            {editRange.to.toDateString()}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (!editing) {
                    setEditOpen(false);
                    setEditBatch(null);
                    setEditRange(undefined);
                  }
                }}
                className="px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={editing}
                className="px-5 py-2.5 rounded-md text-white bg-gradient-to-r from-[#9380FD] to-[#7866FA] hover:opacity-90 disabled:opacity-60"
              >
                {editing ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM (custom, no ShadCN) */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setDeleteOpen(false)} />
          <div className="relative z-[61] w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-900">Delete this batch?</h4>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone. This will permanently delete the batch from your database.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => !deleting && setDeleteOpen(false)}
                className="px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={doDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-md text-white bg-red-500 hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
