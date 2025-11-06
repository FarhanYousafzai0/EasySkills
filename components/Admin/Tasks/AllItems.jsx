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
  Filter,
} from "lucide-react";

export default function AllItems() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [batches, setBatches] = useState(["All"]);
  const [batch, setBatch] = useState("All");
  const [type, setType] = useState("All");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const types = ["All", "Task", "Live"];
  const filters = ["All", "Today", "Upcoming", "Week"];

  // Fetch batches
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/batches", { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const batchNames = data.data.map((b) => b.title || b.name || b);
          setBatches(["All", ...batchNames]);
        } else toast.error("Failed to load batches");
      } catch {
        toast.error("Error fetching batches");
      } finally {
        setBatchLoading(false);
      }
    })();
  }, []);

  // Fetch items with filters
  useEffect(() => {
    fetchItems();
  }, [filter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      let url = "/api/admin/alltask&live";
      if (filter === "Today") url += "?today=true";
      else if (filter === "Week") url += "?week=true";
      else if (filter === "Upcoming") url += "?upcoming=true";

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success) setItems(data.data);
      else throw new Error(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = (id, kind) => {
    toast.message("Confirm Deletion", {
      description: `Delete this ${kind === "task" ? "Task" : "Live Session"}?`,
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const url =
              kind === "task"
                ? `/api/admin/tasks/${id}`
                : `/api/admin/livesessions/${id}`;
            const res = await fetch(url, { method: "DELETE" });
            const data = await res.json();
            if (res.ok && data.success) {
              setItems((prev) => prev.filter((i) => i.id !== id));
              toast.success(`${kind} deleted successfully`);
            } else throw new Error(data.message);
          } catch (err) {
            toast.error(err.message);
          }
        },
      },
    });
  };

  // Toggle status
  const handleUpdateStatus = async (id, kind, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "active" || currentStatus === "scheduled"
          ? "completed"
          : "scheduled";

      const url =
        kind === "task"
          ? `/api/admin/tasks/${id}`
          : `/api/admin/livesessions/${id}`;

      const res = await fetch(url, {
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

  // Filters
  const filtered = useMemo(() => {
    return items.filter((it) => {
      const q = query.toLowerCase();
      const matchesQ =
        (it.kind === "task" && it.title?.toLowerCase().includes(q)) ||
        (it.kind === "live" && it.topic?.toLowerCase().includes(q));

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

  // UI
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

        {/* Filters Bar */}
        <div className="flex flex-wrap gap-3 items-center">
         

          {/* Type Dropdown */}
          <Dropdown
            label={<><Layers size={14} /> {type}</>}
            options={types}
            value={type}
            onChange={setType}
          />

          {/* Batch Dropdown */}
          <Dropdown
            label={<><Hash size={14} /> {batch}</>}
            options={batches}
            value={batch}
            onChange={setBatch}
            loading={batchLoading}
          />

          {/* Filter Dropdown */}
          <Dropdown
            label={<><Filter size={14} /> {filter}</>}
            options={filters}
            value={filter}
            onChange={setFilter}
          />
        </div>
      </div>

      {/* Cards */}
      <AnimatePresence>
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : paginated.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No items found.</p>
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
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono truncate w-32">{it.id}</span>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="relative group cursor-pointer">
                    <MoreVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    <div className="absolute opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 flex flex-col top-6 right-0 bg-white/90 backdrop-blur-lg shadow-xl rounded-xl text-sm z-10 min-w-[160px] py-2 border border-gray-100">
                      <button
                        onClick={() =>
                          handleUpdateStatus(it.id, it.kind, it.status)
                        }
                        className="px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 size={14} /> Toggle Status
                      </button>
                      <button
                        onClick={() => handleDelete(it.id, it.kind)}
                        className="px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body */}
                {it.kind === "task" ? (
                  <>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                      {it.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Due: {new Date(it.due).toLocaleDateString()}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        Task
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                        <Layers className="h-3 w-3" />{" "}
                        {it.batch?.join(", ") || "—"}
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
                      <Calendar className="h-4 w-4" />{" "}
                      {new Date(it.date).toLocaleDateString()} — {it.time}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                        Live
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                        <Layers className="h-3 w-3" /> {it.batch || "—"}
                      </span>
                      {it.recurringWeekly && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                          <Repeat className="h-3 w-3" /> Weekly
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
    </motion.div>
  );
}

/* 💠 Reusable Dropdown Component */
function Dropdown({ label, options, value, onChange, loading }) {
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 bg-gray-100/60 rounded-xl backdrop-blur-md hover:bg-gray-200/60 transition min-w-[180px] justify-between">
        {label}
      </button>
      <div className="absolute opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 flex flex-col mt-2 right-0 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 py-2 z-20 min-w-[180px]">
        {loading ? (
          <p className="px-4 py-2 text-sm text-gray-500">Loading...</p>
        ) : (
          options.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-4 py-2 text-left text-sm hover:bg-gray-100 transition ${
                opt === value ? "text-[#7866FA] font-medium" : ""
              }`}
            >
              {opt}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
