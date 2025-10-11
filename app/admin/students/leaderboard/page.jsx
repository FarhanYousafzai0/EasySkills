"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Trophy, Award } from "lucide-react";

const initialLeaderboard = [
  { id: 1, name: "Ali Khan", batch: "Batch 1", performance: 98, stars: 5 },
  { id: 2, name: "Sara Malik", batch: "Batch 2", performance: 94, stars: 4 },
  { id: 3, name: "Hamza Iqbal", batch: "Batch 1", performance: 91, stars: 4 },
  { id: 4, name: "Hina Noor", batch: "Batch 3", performance: 88, stars: 3 },
  { id: 5, name: "Amna Faisal", batch: "Batch 2", performance: 85, stars: 3 },
  { id: 6, name: "Tariq Ahmed", batch: "Batch 3", performance: 82, stars: 2 },
  { id: 7, name: "Iqra Zaman", batch: "Batch 1", performance: 79, stars: 2 },
  { id: 8, name: "Adeel Raza", batch: "Batch 2", performance: 74, stars: 1 },
];

export default function Leaderboard() {
  const [leaderboard] = useState(initialLeaderboard);

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getMedalColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-yellow-500";
    if (rank === 2) return "from-gray-300 to-gray-400";
    if (rank === 3) return "from-amber-600 to-amber-700";
    return "from-[#9380FD] to-[#7866FA]";
  };

  const getStars = (count) => {
    return Array.from({ length: count }).map((_, i) => (
      <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50 p-6 md:p-10"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        🏆 Leaderboard
      </h2>

      {/* Podium Top 3 */}
      <div className="flex flex-col sm:flex-row justify-center items-end gap-6 mb-12">
        {topThree.map((student, idx) => {
          const rank = idx + 1;
          const size = rank === 1 ? "h-52" : rank === 2 ? "h-44" : "h-40";

          return (
            <motion.div
              key={student.id}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`relative flex flex-col justify-end items-center bg-gradient-to-t ${getMedalColor(
                rank
              )} text-white rounded-2xl shadow-lg p-4 ${size} w-48 cursor-pointer`}
            >
              <div className="absolute -top-6">
                {rank === 1 && (
                  <Trophy size={40} className="text-yellow-300 drop-shadow-md" />
                )}
                {rank === 2 && (
                  <Award size={38} className="text-gray-300 drop-shadow-md" />
                )}
                {rank === 3 && (
                  <Award size={38} className="text-amber-500 drop-shadow-md" />
                )}
              </div>

              <h3 className="text-lg font-semibold mt-6">{student.name}</h3>
              <p className="text-sm text-white/80">{student.batch}</p>
              <div className="flex justify-center gap-1 mt-1">
                {getStars(student.stars)}
              </div>
              <p className="text-sm mt-2 font-medium">
                {student.performance}% Performance
              </p>
              <span className="absolute -bottom-4 text-xl font-bold bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                {rank}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rest.map((s, index) => (
          <motion.div
            key={s.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  #{index + 4} {s.name}
                </h3>
                <p className="text-sm text-gray-500">{s.batch}</p>
              </div>
              <div className="flex">{getStars(s.stars)}</div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.performance}%` }}
                transition={{ duration: 0.8 }}
                className="h-2 rounded-full bg-gradient-to-r from-[#9380FD] to-[#7866FA]"
              ></motion.div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{s.performance}% Performance</span>
              <span className="text-[#7866FA] font-medium cursor-pointer hover:underline">
                View Stats
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
