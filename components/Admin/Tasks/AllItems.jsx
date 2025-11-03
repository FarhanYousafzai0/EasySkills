"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Layers,
  Calendar,
  Video,
  ClipboardList,
  Hash,
  Repeat,
  CheckCircle2,
  CalendarDays,
  Clock3,
} from "lucide-react";

export default function AllItems() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [batches, setBatches] = useState(["All"]);
  const [batch, setBatch] = useState("All");
  const [type, setType] = useState("All");
  const [view, setView] = useState("All"); // NEW: Today | Week | Upcoming | All
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const types = ["All", "Task", "Live"];

  /* 🟣 Fetch batches */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/batches", { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const batchNames = data.data.map((b) => b.title || b.name || b);
          setBatches(["All", ...batchNames]);
        } else toast.error("Failed to load batches");
      } catch (err) {
        console.error(err);
        toast.error("Error fetching batches");
      } finally {
        setBatchLoading(false);
      }
    })();
  }, []);

  /* 🟣 Fetch tasks/sessions */
  useEffect(() => {
    fetchItems();
  }, [view]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const queryParam =
        view === "Today"
          ? "?today=true"
          : view === "Week"
          ? "?week=true"
          : view === "Upcoming"
          ? "?upcoming=true"
          : "";
      const res = await fetch(`/api/admin/alltask&live${queryParam}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) setItems(data.data);
      else throw new Error(data.message || "Failed to fetch items");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* 🟣 Delete (fixed persistence issue) */
  const handleDelete = async (id, kind) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${kind}?`);
    if (!confirmDelete) return;
  
    try {
      const url =
        kind === "task"
          ? `/api/admin/tasks?id=${id}`
          : `/api/admin/livesessions?id=${id}`;
  
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
  
      if (res.ok && data.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success(`${kind === "task" ? "Task" : "Live session"} deleted successfully.`);
      } else {
        throw new Error(data.message || "Failed to delete item.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };
  

  /* 🟣 Toggle status */
  const handleUpdateStatus = async (id, kind, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "active" || currentStatus === "scheduled"
          ? "completed"
          : "scheduled";
      const endpoint =
        kind === "task"
          ? `/api/admin/tasks/${id}`
          : `/api/admin/livesessions/${id}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`${kind} marked as ${newStatus}`);
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        );
      } else throw new Error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* 🟣 Filter + Search */
  const filtered = useMemo(() => {
    return items.filter((it) => {
      const q = query.toLowerCase();
      const matchesQ =
        (it.kind === "task" && it.title?.toLowerCase().includes(q)) ||
        (it.kind === "live" && it.topic?.toLowerCase().includes(q)) ||
        it.id?.toLowerCase().includes(q);

      const matchesType =
        type === "All" ||
        (type === "Task" && it.kind === "task") ||
        (type === "Live" && it.kind === "live");

      const matchesBatch =
        batch === "All" ||
        (it.kind === "task" && it.batch?.includes(batch)) ||
        (it.kind === "live" && it.batch === batch);

      return matchesQ && matchesType && matchesBatch;
    });
  }, [items, query, batch, type]);

  const total = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  /* 🟣 UI */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 bg-white/70 backdrop-blur-lg border border-gray-200/50 shadow-md rounded-2xl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList className="text-[#9380FD]" /> All Tasks & Live Sessions
        </h2>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Search Bar */}
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

          {/* Modern Filter Dropdown */}
          <div className="relative">
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="appearance-none cursor-pointer text-sm text-gray-700 font-medium 
                         bg-transparent focus:outline-none hover:text-[#9380FD] transition"
            >
              {["All", "Today", "Week", "Upcoming"].map((opt) => (
                <option key={opt} value={opt} className="text-gray-800">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="appearance-none cursor-pointer text-sm text-gray-700 font-medium 
                         bg-transparent focus:outline-none hover:text-[#9380FD] transition"
            >
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div className="relative">
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              disabled={batchLoading}
              className="appearance-none cursor-pointer text-sm text-gray-700 font-medium 
                         bg-transparent focus:outline-none hover:text-[#9380FD] transition"
            >
              {batchLoading ? (
                <option>Loading...</option>
              ) : (
                batches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence>
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : paginated.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No items with current filters.
          </p>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {paginated.map((it) => (
              <motion.div
                key={it.id}
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 transition hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono">{it.id}</span>
                  </div>

                  {/* Modern Dropdown */}
                  <div className="relative group">
                    <MoreVertical className="h-5 w-5 text-gray-400 hover:text-[#9380FD] cursor-pointer transition" />
                    <div className="absolute hidden group-hover:flex flex-col top-6 right-0 bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl shadow-lg text-sm z-10">
                      <button
                        onClick={() =>
                          handleUpdateStatus(it.id, it.kind, it.status)
                        }
                        className="px-4 py-2 hover:bg-gray-50 text-left flex items-center gap-2"
                      >
                        <Edit2 size={14} /> Toggle Status
                      </button>
                      <button
                        onClick={() => handleDelete(it.id, it.kind)}
                        className="px-4 py-2 text-red-600 hover:bg-gray-50 text-left flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                {it.kind === "task" ? (
                  <>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                      {it.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Due: {new Date(it.due).toLocaleDateString()}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="badge bg-blue-100 text-blue-700">Task</span>
                      <span className="badge bg-gray-100 text-gray-700 flex items-center gap-1">
                        <Layers className="h-3 w-3" /> {it.batch?.join(", ") || "—"}
                      </span>
                      <span className="badge bg-emerald-100 text-emerald-700 capitalize">
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
                      <CalendarDays className="h-4 w-4" />{" "}
                      {new Date(it.date).toLocaleDateString()}{" "}
                      <Clock3 className="h-4 w-4" /> {it.time}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="badge bg-purple-100 text-purple-700">Live</span>
                      <span className="badge bg-gray-100 text-gray-700 flex items-center gap-1">
                        <Layers className="h-3 w-3" /> {it.batch || "—"}
                      </span>
                      {it.recurringWeekly && (
                        <span className="badge bg-amber-100 text-amber-700 flex items-center gap-1">
                          <Repeat className="h-3 w-3" /> Weekly
                        </span>
                      )}
                      <span className="badge bg-sky-100 text-sky-700 capitalize">
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
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {total}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(total, p + 1))}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
            disabled={page === total}
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  );
}
