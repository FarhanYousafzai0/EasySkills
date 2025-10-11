'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Medal } from 'lucide-react';

const leaders = [
  { name: 'Ali Khan', submissions: 14 },
  { name: 'Sara Malik', submissions: 12 },
  { name: 'Hamza Iqbal', submissions: 9 },
];

export default function Leaderboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-6 md:p-10"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Medal className="text-[#9380FD]" /> Leaderboard
      </h2>

      <div className="space-y-4">
        {leaders.map((leader, i) => (
          <motion.div
            key={leader.name}
            whileHover={{ scale: 1.02 }}
            className={`flex justify-between items-center px-5 py-3 rounded-xl ${
              i === 0
                ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-lg'
                : 'bg-gray-50 text-gray-800'
            }`}
          >
            <span className="font-semibold text-sm md:text-base">
              {i + 1}. {leader.name}
            </span>
            <span className="text-sm md:text-base font-medium">{leader.submissions} Submissions</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
