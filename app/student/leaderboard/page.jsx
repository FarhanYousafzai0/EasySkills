"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Medal,
  Trophy,
  TrendingUp,
  Target,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function StudentLeaderboardPage() {
  const [data, setData] = useState([]);
  const [me, setMe] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLeaderboard();
    fetchMe();
  }, []);

  const fetchLeaderboard = async () => {
    const res = await fetch("/api/admin/leaderboard/all", { cache: "no-store" });
    const json = await res.json();
    if (json.success) setData(json.data || []);
  };

  const fetchMe = async () => {
    const res = await fetch("/api/student/me");
    const json = await res.json();
    if (json.success) setMe(json.user);
  };

  const topThree = data.slice(0, 3);
  const others = data.slice(3);
  const totalPages = Math.ceil(others.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = others.slice(startIndex, startIndex + itemsPerPage);

  const myRank = me ? data.findIndex((x) => x.userId === me.clerkId) + 1 : null;
  const myData = me ? data.find((x) => x.userId === me.clerkId) : null;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="  bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] rounded-md p-2"> <Trophy className="w-8 h-8   text-white" /></div>
            <h1 className="text-4xl font-bold text-black">Leaderboard</h1>
          </div>
          <p className="text-gray-500">
            Compete with your peers and climb the rankings!
          </p>
        </motion.div>

        {/* MY CARD */}
        {me && myData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] rounded-2xl p-6 shadow-xl text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-white" />
                <p className="text-sm font-semibold opacity-90">Your Performance</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Rank */}
                <div>
                  <p className="text-sm opacity-80 mb-1">Your Rank</p>
                  <p className="text-4xl font-bold">#{myRank}</p>
                  <p className="text-sm opacity-80">out of {data.length}</p>
                </div>

                {/* Points */}
                <div>
                  <p className="text-sm opacity-80 mb-1">Total Points</p>
                  <p className="text-4xl font-bold">{myData.points}</p>
                  <p className="text-sm opacity-80">Keep pushing!</p>
                </div>

                {/* Tasks */}
                <div>
                  <p className="text-sm opacity-80 mb-1">Tasks Completed</p>
                  <p className="text-4xl font-bold">{myData.tasksCompleted}</p>
                  <p className="text-sm opacity-80">Great work!</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TOP 3 CLEAN VERSION */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
            <Award className="text-white" /> Top Performers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThree.map((user, index) => {
              const isMe = me && user.userId === me.clerkId;

              /** FINAL THEME:
               * 🥇 1st: Gold Icon, White Card + Purple Border
               * 🥈🥉 2nd/3rd: Purple Icon (Medal), White Card
               */

              const placeText =
                index === 0 ? "1st Place" : index === 1 ? "2nd Place" : "3rd Place";

              const Icon = index === 0 ? Trophy : Medal;
              const iconColor =
                index === 0 ? "text-white" : "text-[#7866FA]";

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  {/* Badge */}
                  <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] flex items-center justify-center shadow-lg">
                    <Icon className={`w-7 h-7 text-white ${iconColor}`} />
                  </div>

                  {/* Card */}
                  <div
                    className={`bg-white rounded-2xl p-6 shadow-xl border ${
                      isMe
                        ? "border-[#7866FA] ring-4 ring-[#7866FA]/20"
                        : "border-slate-200 hover:border-[#7866FA]"
                    }`}
                  >
                    {isMe && (
                      <div className="absolute -top-3 left-4 bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] text-white text-xs font-bold px-3 py-1 rounded-full">
                        YOU
                      </div>
                    )}

                    <p className="text-sm text-gray-500">{placeText}</p>
                    <h3 className="text-xl font-bold text-black">{user.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">Batch {user.batch}</p>

                    {/* Stats */}
                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Points</span>
                        <span className="text-xl font-bold text-black">{user.points}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tasks</span>
                        <span className="text-lg font-semibold text-black">
                          {user.tasksCompleted}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* TABLE */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl font-bold text-black mb-6">All Rankings</h2>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Rank", "Student", "Batch", "Points", "Tasks"].map((h) => (
                    <th
                      key={h}
                      className="py-4 px-6 text-left font-semibold text-gray-600 text-sm"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((user, i) => {
                  const rank = startIndex + i + 4;
                  const isMe = me && user.userId === me.clerkId;

                  return (
                    <tr
                      key={user._id}
                      className={`border-t border-slate-100 ${
                        isMe ? "bg-purple-50/50 font-semibold" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isMe
                              ? "bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] text-white"
                              : "bg-slate-100 text-gray-700"
                          }`}
                        >
                          {rank}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-black flex items-center gap-2">
                        {user.name}
                        {isMe && (
                          <span className="bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] text-white text-xs px-2 py-1 rounded-full">
                            YOU
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-gray-600">{user.batch}</td>

                      <td className="py-4 px-6">
                        <span className="font-bold text-black">{user.points}</span>
                      </td>

                      <td className="py-4 px-6 text-gray-700 font-medium">
                        {user.tasksCompleted}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="border-t border-slate-200 p-4 bg-white">
                <div className="flex justify-center items-center gap-2">
                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-100 transition"
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

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-100 transition"
                  >
                    <ChevronRight className="w-5 h-5 text-black" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
