'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpenCheck } from 'lucide-react';

export default function CoursesPage() {
  return (
    <div className="min-h-[90%] rounded-xl bg-gradient-to-br from-[#9380FD] via-[#7866FA] to-[#5C4DF3] flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl text-white"
      >
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-white/20 rounded-2xl">
            <BookOpenCheck size={40} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Exciting Courses <br /> Are Coming Soon!
        </h1>
        <p className="text-white/90 leading-relaxed text-lg mb-6">
          We’re building an incredible learning experience filled with live mentorship,
          AI-powered feedback, and interactive lessons.  
          Stay tuned — the next big step in your journey starts here.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="mt-3 px-6 py-3 rounded-lg bg-white text-[#5B4DF5] font-semibold shadow-md hover:shadow-lg transition cursor-pointer"
        >
          Notify Me When Live
        </motion.button>
      </motion.div>
    </div>
  );
}
