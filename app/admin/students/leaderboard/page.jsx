"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  Target,
  TrendingUp,
  Award
} from "lucide-react";

export default function AdminLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchAdminLeaderboard();
  }, []);

  const fetchAdminLeaderboard = async () => {
    const res = await fetch("/api/admin/leaderboard/all");
    const data = await res.json();

    if (data.success) {
      setLeaderboard(data.data);
      const uniqueBatches = [...new Set(data.data.map((s) => s.batch))];
      setBatches(uniqueBatches);
    }
    setLoading(false);
  };

  const filteredList = leaderboard
    .filter((x) => selectedBatch === "all" || x.batch === selectedBatch)
    .filter((x) => x.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const topThree = filteredList.slice(0, 3);
  const others = filteredList.slice(3);

  const totalPages = Math.ceil(others.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = others.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: filteredList.length,
    avgPoints:
      Math.round(
        filteredList.reduce((a, b) => a + b.points, 0) / filteredList.length
      ) || 0,
    topScore: filteredList[0]?.points || 0,
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] rounded-md p-2">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-black">Leaderboard</h1>
          </div>
          <p className="text-gray-500">
            Track student performance and achievements
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-black">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-[#7866FA] opacity-30" />
            </div>
          </motion.div>

          {/* Average Points */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Average Points</p>
                <p className="text-3xl font-bold text-black">
                  {stats.avgPoints}
                </p>
              </div>
              <Target className="w-10 h-10 text-[#7866FA] opacity-30" />
            </div>
          </motion.div>

          {/* Top Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Top Score</p>
                <p className="text-3xl font-bold text-black">
                  {stats.topScore}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-[#7866FA] opacity-30" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7866FA] w-5 h-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#7866FA] focus:ring-2 focus:ring-[#7866FA]/30 outline-none transition text-black"
              />
            </div>

            {/* Batch Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full md:w-56 bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm flex justify-between items-center hover:border-[#7866FA] transition text-black"
              >
                {selectedBatch === "all"
                  ? "All Batches"
                  : `Batch ${selectedBatch}`}
                <span className="text-gray-400">▾</span>
              </button>

              {dropdownOpen && (
                <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                  <div
                    className="px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedBatch("all");
                      setDropdownOpen(false);
                    }}
                  >
                    All Batches
                  </div>

                  {batches.map((b) => (
                    <div
                      key={b}
                      className="px-4 py-3 text-sm hover:bg-gray-100 cursor-pointer border-t border-slate-100"
                      onClick={() => {
                        setSelectedBatch(b);
                        setDropdownOpen(false);
                      }}
                    >
                      Batch {b}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Top Performers */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
            <Award className="text-yellow-400" /> Top Performers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThree.map((s, index) => (
              <motion.div
                key={s.userId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                {/* Purple Gradient Badge */}
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] flex items-center justify-center shadow-lg">
                  <Medal className="w-6 h-6 text-white" />
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl hover:border-[#7866FA] hover:shadow-2xl transition">
                  <p className="text-sm text-gray-500 mb-1">
                    {index === 0
                      ? "1st Place"
                      : index === 1
                      ? "2nd Place"
                      : "3rd Place"}
                  </p>
                  <h3 className="text-xl font-bold text-black">{s.name}</h3>
                  <p className="text-sm text-gray-500">Batch {s.batch}</p>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Points</p>
                    <p className="text-2xl font-bold text-black">{s.points}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Students Grid */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">All Students</h2>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {paginatedData.map((s, idx) => (
                <motion.div
                  key={s.userId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg hover:border-[#7866FA] hover:shadow-2xl transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-black">{s.name}</h3>
                      <p className="text-sm text-gray-500">Batch {s.batch}</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] text-white flex items-center justify-center font-bold">
                      #{startIndex + idx + 4}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Points</p>
                    <p className="text-2xl font-bold text-black">{s.points}</p>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Tasks Completed</p>
                    <p className="text-lg font-semibold text-black">
                      {s.tasksCompleted}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 hover:bg-gray-100 transition"
              >
                <ChevronLeft className="w-5 h-5 text-black" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-semibold transition ${
                    currentPage === i + 1
                      ? "bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] text-white shadow-lg"
                      : "bg-white border border-slate-200 text-black hover:border-[#7866FA]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 hover:bg-gray-100 transition"
              >
                <ChevronRight className="w-5 h-5 text-black" />
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7866FA] border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
}
