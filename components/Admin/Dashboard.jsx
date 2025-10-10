"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Users,
  ClipboardList,
  FileText,
  TrendingUp,
  BarChart2,
} from "lucide-react";

// Dynamically import ApexCharts (Next.js SSR fix)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Dashboard() {
  const [activeCard, setActiveCard] = useState("students");

  const cards = [
    {
      id: "students",
      title: "Total Students",
      value: "1,284",
      sub: "Enrolled this month",
      icon: <Users size={28} />,
      growth: "+4.8%",
    },
    {
      id: "tasks",
      title: "Total Tasks",
      value: "392",
      sub: "Created by instructors",
      icon: <ClipboardList size={28} />,
      growth: "+2.4%",
    },
    {
      id: "assignments",
      title: "Assignments Submitted",
      value: "2,145",
      sub: "Student submissions",
      icon: <FileText size={28} />,
      growth: "+12.5%",
    },
    {
      id: "courses",
      title: "Active Courses",
      value: "37",
      sub: "Ongoing this term",
      icon: <TrendingUp size={28} />,
      growth: "+1.2%",
    },
  ];

  const barOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      foreColor: "#999",
    },
    grid: { borderColor: "#eee" },
    colors: ["#9380FD", "#7866FA"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
  };

  const barSeries = [
    { name: "Students", data: [30, 45, 60, 80, 100, 75, 40] },
    { name: "Tasks", data: [20, 35, 28, 50, 60, 45, 25] },
  ];

  const radialOptions = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        hollow: { size: "65%" },
        dataLabels: {
          name: { show: true, color: "#888" },
          value: { show: true, fontSize: "24px", color: "#7866FA" },
        },
      },
    },
    labels: ["Course Completion"],
    colors: ["#9380FD"],
  };

  const radialSeries = [76];

  return (
    <div className="w-full p-5 md:p-8 min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time overview of student activity and progress.
          </p>
        </div>

        <select className="mt-4 md:mt-0 bg-white border text-gray-700 rounded-lg px-4 py-2 shadow-sm cursor-pointer">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => {
          const isActive = activeCard === card.id;
          return (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCard(card.id)}
              className={`p-6 rounded-2xl shadow-md cursor-pointer transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-lg"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div
                  className={`p-3 rounded-xl ${
                    isActive ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  {React.cloneElement(card.icon, {
                    className: isActive ? "text-white" : "text-[#7866FA]",
                  })}
                </div>
                <span
                  className={`text-sm font-medium ${
                    card.growth.startsWith("+")
                      ? isActive
                        ? "text-white"
                        : "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {card.growth}
                </span>
              </div>
              <h3 className="text-2xl font-bold">{card.value}</h3>
              <p className={`text-sm ${isActive ? "text-white/80" : "text-gray-600"}`}>
                {card.title}
              </p>
              <span className={`text-xs ${isActive ? "text-white/60" : "text-gray-400"}`}>
                {card.sub}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Second Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Student & Task Overview
          </h3>
          <Chart
            options={barOptions}
            series={barSeries}
            type="bar"
            height={320}
            width="100%"
          />
        </motion.div>

        {/* Radial Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Course Completion Rate
          </h3>
          <Chart
            options={radialOptions}
            series={radialSeries}
            type="radialBar"
            height={280}
          />
        </motion.div>

        {/* Info Bento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Quick Insights
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            87% of students completed their latest assignments on time. 5 new
            instructors joined this week. 230 new submissions were received in
            the last 24 hours.
          </p>
          <button className="px-4 py-2 rounded-md bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-medium cursor-pointer hover:opacity-90 transition">
            View Reports
          </button>
        </motion.div>
      </div>
    </div>
  );
}
