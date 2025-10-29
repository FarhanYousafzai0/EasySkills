'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit2,
  Trash2,
  Search,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return '';
  }
}

const PLAN_OPTIONS = [
  '1-on-1 Mentorship',
  'Group Mentorship',
  'Self-Paced Course',
  'Internship Access',
];

export default function AllStudents() {
  // data
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);

  // ui state
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All');

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  // delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // load data
  const loadAll = async () => {
    try {
      setLoading(true);
      const [sRes, bRes] = await Promise.all([
        fetch('/api/admin/student', { cache: 'no-store' }),
        fetch('/api/admin/batches', { cache: 'no-store' }),
      ]);
      const sData = await sRes.json();
      const bData = await bRes.json();

      if (!sRes.ok || !sData?.success) throw new Error(sData?.message || 'Failed to load students');
      if (!bRes.ok || !bData?.success) throw new Error(bData?.message || 'Failed to load batches');

      setStudents(sData.data || []);
      setBatches(bData.data || []);
    } catch (err) {
      toast.error(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // filtering
  const batchOptions = useMemo(() => ['All', ...batches.map((b) => b.title)], [batches]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const matchesQ =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q);
      const matchesBatch = selectedBatch === 'All' || s.batch === selectedBatch;
      return matchesQ && matchesBatch;
    });
  }, [students, query, selectedBatch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    // reset to page 1 if filter/search changes
    setCurrentPage(1);
  }, [query, selectedBatch]);

  // edit
  const openEdit = (s) => {
    setEditStudent({
      _id: s._id,
      name: s.name || '',
      email: s.email || '',
      phone: s.phone || '',
      plan: s.plan || '',
      batch: s.batch || '',
      joinDate: s.joinDate ? new Date(s.joinDate).toISOString().slice(0, 10) : '',
      notes: s.notes || '',
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editStudent?.name || !editStudent?.email || !editStudent?.plan || !editStudent?.joinDate) {
      toast.error('Name, Email, Plan, and Join Date are required.');
      return;
    }
    try {
      setEditing(true);
      const res = await fetch(`/api/admin/student/${editStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editStudent.name,
          email: editStudent.email,
          phone: editStudent.phone,
          plan: editStudent.plan,
          batch: editStudent.plan === '1-on-1 Mentorship' ? '' : editStudent.batch,
          joinDate: editStudent.joinDate,
          notes: editStudent.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to update student');
      setStudents((prev) => prev.map((s) => (s._id === editStudent._id ? data.data : s)));
      toast.success('Student updated');
      setEditOpen(false);
      setEditStudent(null);
    } catch (err) {
      toast.error(err.message || 'Error updating student');
    } finally {
      setEditing(false);
    }
  };

  // delete
  const confirmDelete = (id) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/student/${deletingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Delete failed');
      setStudents((prev) => prev.filter((s) => s._id !== deletingId));
      toast.success('Student deleted');
      setDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err.message || 'Error deleting student');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-white/70 backdrop-blur-lg shadow-md border border-gray-200/50 rounded-2xl p-6 md:p-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users className="text-[#9380FD]" />
            <h2 className="text-2xl font-bold text-gray-800">All Students</h2>
          </div>

          {/* TOOLBAR */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <motion.div whileFocus={{ scale: 1.02 }}
              className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full sm:w-auto">
              <Search size={18} className="text-gray-500 mr-2" />
              <input
                placeholder="Search students..."
                className="bg-transparent outline-none text-sm text-gray-700 w-full sm:w-48"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </motion.div>

            {/* Batch Filter */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilterOpen((p) => !p)}
                className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-all"
              >
                <Filter size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">
                  {selectedBatch === 'All' ? 'Filter by Batch' : selectedBatch}
                </span>
                <motion.span animate={{ rotate: filterOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} className="text-gray-600" />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-xl z-20"
                  >
                    {batchOptions.map((batch) => (
                      <motion.button
                        key={batch}
                        whileHover={{ x: 5 }}
                        onClick={() => {
                          setSelectedBatch(batch);
                          setFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-all rounded-lg cursor-pointer ${
                          selectedBatch === batch
                            ? 'bg-gradient-to-r from-[#9380FD]/80 to-[#7866FA]/80 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {batch}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* LOADING — YouTube skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white shadow-md p-5 relative overflow-hidden">
                <div className="h-6 w-3/4 mt-2 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:400%_100%] animate-[shimmer_1.6s_infinite]" />
                <div className="h-3 w-1/2 mt-3 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:400%_100%] animate-[shimmer_1.6s_infinite]" />
                <div className="h-3 w-4/5 mt-2 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:400%_100%] animate-[shimmer_1.6s_infinite]" />
                <div className="h-24 w-full mt-4 rounded-lg bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:400%_100%] animate-[shimmer_1.6s_infinite]" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:400%_100%] animate-[shimmer_1.6s_infinite]" />
                  <div className="h-8 w-8 rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:400%_100%] animate-[shimmer_1.6s_infinite]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-500 py-10">No students found.</p>
        )}

        {/* GRID */}
        {!loading && filtered.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {pageItems.map((s) => (
              <motion.div
                key={s._id}
                whileHover={{ y: -3, scale: 1.01 }}
                className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 relative"
              >
                {/* Hover actions */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    onClick={() => openEdit(s)}
                    className="p-2 rounded-md bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md hover:opacity-90 cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    onClick={() => confirmDelete(s._id)}
                    className="p-2 rounded-md bg-red-500 text-white shadow-md hover:bg-red-600 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>

                <h3 className="text-lg font-semibold text-gray-800">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.email}</p>

                <div className="mt-3 text-sm text-gray-700">
                  <p>📚 Plan: <span className="font-medium">{s.plan || '-'}</span></p>
                  <p>🎓 Batch: <span className="font-medium">{s.batch || '—'}</span></p>
                  <p className="flex items-center gap-1">
                    <Calendar size={14} className="text-[#9380FD]" />
                    Join: <span className="font-medium ml-1">{formatDate(s.joinDate)}</span>
                  </p>
                </div>

                <div className="flex justify-end mt-4 gap-2">
                  <button className="cursor-pointer bg-gray-100 text-gray-700 text-xs px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                    Message
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
              title="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-gray-700 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="cursor-pointer p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
              title="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </motion.div>

      {/* EDIT MODAL (custom, no ShadCN) */}
      {editOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!editing) {
                setEditOpen(false);
                setEditStudent(null);
              }
            }}
          />
          <div className="relative z-[61] w-full max-w-3xl bg-white rounded-2xl border border-gray-200 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Edit2 size={18} /> Edit Student
              </h3>
              <button
                className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  if (!editing) {
                    setEditOpen(false);
                    setEditStudent(null);
                  }
                }}
              >
                <X size={18} />
              </button>
            </div>

            {editStudent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={editStudent.name}
                    onChange={(e) => setEditStudent((s) => ({ ...s, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#9380FD]"
                  />

                  <label className="block text-sm font-semibold text-gray-700 mt-4 mb-1">Email *</label>
                  <input
                    type="email"
                    value={editStudent.email}
                    onChange={(e) => setEditStudent((s) => ({ ...s, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#9380FD]"
                  />

                  <label className="block text-sm font-semibold text-gray-700 mt-4 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editStudent.phone}
                    onChange={(e) => setEditStudent((s) => ({ ...s, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#9380FD]"
                  />
                </div>

                {/* Right */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Plan *</label>
                  <select
                    value={editStudent.plan}
                    onChange={(e) => setEditStudent((s) => ({ ...s, plan: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-[#9380FD]"
                  >
                    <option value="">Select plan</option>
                    {PLAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <label className="block text-sm font-semibold text-gray-700 mt-4 mb-1">
                    Batch <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    value={editStudent.batch}
                    onChange={(e) => setEditStudent((s) => ({ ...s, batch: e.target.value }))}
                    disabled={editStudent.plan === '1-on-1 Mentorship'}
                    className={`w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-white outline-none focus:ring-2 ${
                      editStudent.plan === '1-on-1 Mentorship'
                        ? 'opacity-50 cursor-not-allowed'
                        : 'focus:ring-[#9380FD]'
                    }`}
                  >
                    <option value="">Select Batch</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b.title}>
                        {b.title}
                      </option>
                    ))}
                  </select>

                  <label className="block text-sm font-semibold text-gray-700 mt-4 mb-1">Join Date *</label>
                  <input
                    type="date"
                    value={editStudent.joinDate}
                    onChange={(e) => setEditStudent((s) => ({ ...s, joinDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#9380FD] bg-white"
                  />
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
              <textarea
                rows={4}
                value={editStudent?.notes || ''}
                onChange={(e) => setEditStudent((s) => ({ ...s, notes: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#9380FD]"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (!editing) {
                    setEditOpen(false);
                    setEditStudent(null);
                  }
                }}
                className="px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={editing}
                className="px-5 py-2.5 rounded-md text-white bg-gradient-to-r from-[#9380FD] to-[#7866FA] hover:opacity-90 disabled:opacity-60 cursor-pointer"
              >
                {editing ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteOpen(false)}
          />
          <div className="relative z-[61] w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-900">Delete this student?</h4>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone. This will permanently delete the student from your database.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => !deleting && setDeleteOpen(false)}
                className="px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={doDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-md text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 cursor-pointer"
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

/* Add this once to your global CSS (globals.css or tailwind.css):
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
*/
