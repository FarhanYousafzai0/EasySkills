"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Trophy, Award } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function StudentLeaderboard() {
  const { user } = useUser();
  const batch = user?.publicMetadata?.batch;

  const [leaderboard, setLeaderboard] = useState([]);
  const [mode, setMode] = useState("global");
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);

    let res;

    if (mode === "global") {
      res = await fetch("/api/student/leaderboard/global");
    } else {
      res = await fetch("/api/student/leaderboard/batch", {
        method: "POST",
        body: JSON.stringify({ batch }),
      });
    }

    const data = await res.json();
    if (data.success) setLeaderboard(data.data);

    setLoading(false);
  };

  useEffect(() => {
    if (batch) fetchLeaderboard();
  }, [mode, batch]);

  const getMedalColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-yellow-500";
    if (rank === 2) return "from-gray-300 to-gray-400";
    if (rank === 3) return "from-amber-600 to-amber-700";
    return "from-[#9380FD] to-[#7866FA]";
  };

  const calculateStars = (points) => {
    if (points >= 100) return 5;
    if (points >= 75) return 4;
    if (points >= 50) return 3;
    if (points >= 25) return 2;
    return 1;
  };

  const getStars = (count) =>
    Array.from({ length: count }).map((_, i) => (
      <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
    ));

  if (loading) return <p className="p-10 text-gray-600">Loading leaderboard…</p>;

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50 p-6 md:p-10"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">🏆 Leaderboard</h2>

        <select
          className="border rounded-lg p-2 text-sm"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="global">🌍 Global Ranking</option>
          <option value="batch">📌 My Batch ({batch})</option>
        </select>
      </div>

      {/* PODIUM */}
      <div className="flex flex-col sm:flex-row justify-center items-end gap-6 mb-12">
        {topThree.map((student, idx) => {
          const rank = idx + 1;
          const stars = calculateStars(student.points);
          const size = rank === 1 ? "h-52" : rank === 2 ? "h-44" : "h-40";

          return (
            <motion.div
              key={student.userId}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`relative flex flex-col justify-end items-center bg-gradient-to-t ${getMedalColor(
                rank
              )} text-white rounded-2xl shadow-lg p-4 ${size} w-48`}
            >
              <div className="absolute -top-6">
                {rank === 1 && <Trophy size={40} className="text-yellow-300" />}
                {rank === 2 && <Award size={38} className="text-gray-300" />}
                {rank === 3 && <Award size={38} className="text-amber-600" />}
              </div>

              <h3 className="text-lg font-semibold mt-6">{student.userId}</h3>
              <p className="text-sm text-white/80">{student.batch}</p>

              <div className="flex gap-1 mt-2">{getStars(stars)}</div>

              <p className="text-sm mt-2 font-medium">{student.points} Points</p>

              <span className="absolute -bottom-4 bg-white text-gray-800 w-10 h-10 rounded-full flex justify-center items-center font-bold shadow-md">
                {rank}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* REST LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rest.map((s, index) => {
          const stars = calculateStars(s.points);

          return (
            <motion.div
              key={s.userId}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    #{index + 4} {s.userId}
                  </h3>
                  <p className="text-sm text-gray-500">{s.batch}</p>
                </div>
                <div className="flex">{getStars(stars)}</div>
              </div>

              <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((s.points / 100) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.8 }}
                  className="h-2 rounded-full bg-gradient-to-r from-[#9380FD] to-[#7866FA]"
                ></motion.div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{s.points} Points</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
