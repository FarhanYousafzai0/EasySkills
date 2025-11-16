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
  RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return '';
  }
}

export default function AllStudents() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Renew modal
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDays, setSelectedDays] = useState(30);
  const PRESET_DAYS = [7, 14, 30, 60, 90];

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [sRes, bRes] = await Promise.all([
        fetch('/api/admin/student', { cache: 'no-store' }),
        fetch('/api/admin/batches', { cache: 'no-store' }),
      ]);
      const sData = await sRes.json();
      const bData = await bRes.json();

      if (!sData.success) throw new Error(sData.message || 'Failed to load students');
      if (!bData.success) throw new Error(bData.message || 'Failed to load batches');

      setStudents(sData.data);
      setBatches(bData.data);
    } catch (err) {
      toast.error(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const matchesQ =
        !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchesBatch = selectedBatch === 'All' || s.batch === selectedBatch;
      return matchesQ && matchesBatch;
    });
  }, [students, query, selectedBatch]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedBatch]);

  const openRenewModal = (student) => {
    setSelectedStudent(student);
    setSelectedDays(30);
    setRenewOpen(true);
  };

  // --------------------------
  // DELETE STUDENT
  // --------------------------
  const deleteStudent = async () => {
    try {
      const res = await fetch(`/api/admin/student/${selectedStudent._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Student deleted.");
      setDeleteOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Error deleting student');
    }
  };

  // --------------------------
  // EDIT STUDENT
  // --------------------------
  const saveEdit = async () => {
    try {
      const res = await fetch(`/api/admin/student/${editForm._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success("Student updated.");
      setEditOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const renewMentorship = async () => {
    if (!selectedStudent) return;

    try {
      setRenewing(true);

      const res = await fetch(`/api/admin/renew/${selectedStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: selectedDays }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success('Mentorship renewed successfully!');
      setRenewOpen(false);
      setSelectedStudent(null);
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Error renewing mentorship');
    } finally {
      setRenewing(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/60 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-6 md:p-10"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <Users className="text-[#9380FD]" />
            <h2 className="text-3xl font-bold text-gray-800">All Students</h2>
          </div>

          {/* Search + filter */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-xl">
              <Search size={18} className="text-gray-500 mr-2" />
              <input
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent outline-none text-sm w-48"
              />
            </div>

            <div className="relative">
              <motion.button
                onClick={() => setFilterOpen((p) => !p)}
                className="flex items-center gap-2 bg-gray-100 py-2 px-4 rounded-xl cursor-pointer"
              >
                <Filter size={16} className="text-gray-600" />
                {selectedBatch === 'All' ? 'Batch Filter' : selectedBatch}
                <ChevronDown size={16} />
              </motion.button>

              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    className="absolute w-56 right-0 mt-2 bg-white shadow-xl border rounded-xl p-2 z-40"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <button
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedBatch('All');
                        setFilterOpen(false);
                      }}
                    >
                      All
                    </button>
                    {batches.map((b) => (
                      <button
                        key={b._id}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedBatch(b.title);
                          setFilterOpen(false);
                        }}
                      >
                        {b.title}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* List */}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-500">No students found.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pageItems.map((s) => {
            const expired = new Date(s.mentorshipEnd) < new Date();

            return (
              <motion.div
                key={s._id}
                className="bg-white/40 backdrop-blur-2xl border border-gray-200 rounded-3xl shadow-xl p-5 relative"
                whileHover={{ y: -3 }}
              >
                {/* ACTION BUTTONS */}
                <div className="absolute top-4 right-4 flex gap-3 opacity-80">
                  <Edit2
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    size={18}
                    onClick={() => {
                      setEditForm(s);
                      setEditOpen(true);
                    }}
                  />
                  <Trash2
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                    size={18}
                    onClick={() => {
                      setSelectedStudent(s);
                      setDeleteOpen(true);
                    }}
                  />
                </div>

                <h3 className="text-xl font-semibold text-gray-800">{s.name}</h3>
                <p className="text-sm text-gray-600">{s.email}</p>

                <div className="mt-3 space-y-1 text-gray-700 text-sm">
                  <p>📘 Plan: {s.plan}</p>
                  <p>🎓 Batch: {s.batch || '—'}</p>
                  <p className="flex gap-1 items-center">
                    <Calendar size={14} className="text-[#9380FD]" />
                    Joined: {formatDate(s.joinDate)}
                  </p>
                </div>

                {/* Mentorship Status */}
                <div className="mt-3">
                  {expired ? (
                    <p className="text-red-600 font-semibold text-sm">
                      🔴 Mentorship Expired
                    </p>
                  ) : (
                    <p className="text-green-600 font-semibold text-sm">
                      🟢 {s.mentorshipDaysLeft} Days Left
                    </p>
                  )}
                </div>

                {/* Renew Button */}
                <button
                  onClick={() => openRenewModal(s)}
                  className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-medium shadow hover:opacity-90 cursor-pointer"
                >
                  <RefreshCcw size={16} className="inline-block mr-1" />
                  Renew Mentorship
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 bg-gray-100 rounded-lg cursor-pointer"
            >
              <ChevronLeft />
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 bg-gray-100 rounded-lg cursor-pointer"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </motion.div>

      {/* Renew Modal */}
      {renewOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !renewing && setRenewOpen(false)}
          />

          <div className="relative z-[101] bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Renew Mentorship
              </h3>
              <button
                onClick={() => !renewing && setRenewOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-gray-600 mb-2">
              Renew for <strong>{selectedStudent?.name}</strong>
            </p>

            <div className="space-y-2">
              {PRESET_DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDays(d)}
                  className={`w-full p-3 rounded-xl border cursor-pointer ${
                    selectedDays === d
                      ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {d} Days
                </button>
              ))}

              {/* custom input */}
              <input
                type="number"
                placeholder="Custom days"
                className="w-full p-3 rounded-xl border bg-gray-100"
                onChange={(e) => setSelectedDays(Number(e.target.value))}
              />
            </div>

            <button
              onClick={renewMentorship}
              disabled={renewing}
              className="mt-5 w-full py-3 bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white rounded-xl shadow font-medium cursor-pointer"
            >
              {renewing ? 'Renewing…' : 'Confirm Renewal'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteOpen(false)}
          />

          <div className="relative z-[101] bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Delete Student
            </h3>
            <p className="text-gray-600 mb-5">
              Are you sure you want to delete{' '}
              <strong>{selectedStudent?.name}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 py-2 bg-gray-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={deleteStudent}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl shadow cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[110]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditOpen(false)}
          />

          <div className="relative z-[111] bg-white p-6 rounded-3xl shadow-2xl w-full max-w-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Student
            </h3>

            {/* Name */}
            <input
              type="text"
              className="w-full p-3 mb-3 border rounded-xl bg-gray-50"
              placeholder="Full Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />

            {/* Email */}
            <input
              type="email"
              className="w-full p-3 mb-3 border rounded-xl bg-gray-50"
              placeholder="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
            />

            {/* Phone */}
            <input
              type="text"
              className="w-full p-3 mb-3 border rounded-xl bg-gray-50"
              placeholder="Phone"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 py-3 bg-gray-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-3 bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white rounded-xl shadow cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
