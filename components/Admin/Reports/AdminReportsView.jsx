"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminReportsCards() {
  const initialReports = [
    {
      id: 1,
      student: "Ali Khan",
      title: "Quiz not loading properly",
      type: "Bug",
      description:
        "When attempting to start Quiz 3 under Batch 2, the loader spins indefinitely after clicking the 'Start Quiz' button. Tried on multiple browsers including Chrome and Edge but same issue persists. Screenshots attached on email. Needs urgent fix before Monday evaluation session.",
      submittedAt: "2025-10-12",
    },
    {
      id: 2,
      student: "Sara Malik",
      title: "Add Dark Mode",
      type: "Suggestion",
      description:
        "The white background strains eyes during late-night study. Dark mode would be great for both accessibility and comfort during long sessions.",
      submittedAt: "2025-10-11",
    },
    {
      id: 3,
      student: "Hamza Iqbal",
      title: "Slow dashboard performance",
      type: "Performance",
      description:
        "Admin dashboard loads slowly on 3G mobile networks. Maybe we can lazy-load graphs or reduce heavy assets for mobile view. User experience becomes difficult otherwise.",
      submittedAt: "2025-10-10",
    },
  ];

  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.student.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || r.type === filterType;
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const updateStatus = (id, newStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <AlertCircle className="text-[#9380FD]" />
          Student Reports & Suggestions
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            />
          </div>

          <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border">
            <Filter size={18} className="text-gray-500 mr-2" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 cursor-pointer"
            >
              {["All", "Bug", "Suggestion", "Performance", "UI"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

         
        </div>
      </div>

      {/* Reports Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredReports.length > 0 ? (
            filteredReports.map((r) => {
              const isExpanded = expanded === r.id;
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg p-6 border border-gray-100 cursor-pointer transition"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {r.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {r.student} • {r.submittedAt}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        r.type === "Bug"
                          ? "bg-red-100 text-red-600"
                          : r.type === "Suggestion"
                          ? "bg-purple-100 text-purple-600"
                          : r.type === "Performance"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {r.type}
                    </span>
                  </div>

                  {/* Description */}
                  <motion.div layout>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      {isExpanded
                        ? r.description
                        : `${r.description.slice(0, 120)}${
                            r.description.length > 120 ? "..." : ""
                          }`}
                    </p>
                    {r.description.length > 120 && (
                      <button
                        onClick={() => toggleExpand(r.id)}
                        className="flex items-center text-[#7866FA] text-sm font-medium hover:underline cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            Read less <ChevronUp size={14} className="ml-1" />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDown size={14} className="ml-1" />
                          </>
                        )}
                      </button>
                    )}
                  </motion.div>

                
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 col-span-full py-10"
            >
              No reports found for this filter.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
