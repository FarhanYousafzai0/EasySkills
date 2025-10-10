"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Star, Users, DollarSign } from "lucide-react";

export default function StatsAndEnroll() {
  // Countdown logic
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2025-12-31T23:59:59");
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: <CalendarDays className="text-indigo-600 w-8 h-8" />, value: "7+", label: "Years of Experience" },
    { icon: <Star className="text-yellow-500 w-8 h-8" />, value: "13+", label: "Successful Batches" },
    { icon: <Users className="text-green-500 w-8 h-8" />, value: "12,000+", label: "Graduated Students" },
    { icon: <DollarSign className="text-orange-500 w-8 h-8" />, value: "$250M+", label: "Cumulative Revenue" },
  ];

  return (
    <div className="w-[95%] mx-auto mt-24">
      {/* === STATS SECTION === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-2xl py-16 px-6 md:px-16 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          Our Numbers Speak for Themselves
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          A decade of dedication, thousands of graduates, and millions in growth.
          These numbers represent our proven results and impact in the learning industry.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center bg-gradient-to-br hover:scale-105 transition-all duration-300 from-[#9380FD] to-[#7866FA]  p-6 rounded-2xl shadow-sm transition"
            >
              <div className="p-4 bg-white rounded-full shadow-md mb-3">{stat.icon}</div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-white text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>


    </div>
  );
}
