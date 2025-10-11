"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Users,
  ClipboardList,
  FileText,
  Video,
  Layers,
  CalendarDays,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

// ApexCharts (Next.js SSR)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Dashboard() {
  const router = useRouter();

  // ---- Mock analytics (wire to MongoDB later) ----
  const [activeBatches] = useState(3);
  const [sessionsThisWeek] = useState(5);
  const [studentsTotal] = useState("1,284");
  const [tasksTotal] = useState("392");
  const [assignmentsSubmitted] = useState("2,145");

  // Example upcoming sessions (replace with GET /api/sessions?upcoming=true later)
  const [sessions] = useState([
    {
      id: "S-311",
      batch: "Batch 2",
      topic: "React Fundamentals",
      date: new Date(), // today
      time: "20:00",
      link: "https://zoom.us/j/123456789",
      recurring: true,
    },
    {
      id: "S-312",
      batch: "Batch 3",
      topic: "AI Foundations",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      time: "21:00",
      link: "https://zoom.us/j/987654321",
      recurring: true,
    },
  ]);

  // Next happening (today if available, else nearest future)
  const nextSession = useMemo(() => {
    const now = new Date();
    const copy = [...sessions].sort((a, b) => +a.date - +b.date);
    return copy.find((s) => new Date(s.date).setHours(0,0,0,0) >= now.setHours(0,0,0,0));
  }, [sessions]);

  // ---- Cards data ----
  const cards = [
    {
      id: "students",
      title: "Total Students",
      value: studentsTotal,
      sub: "Enrolled this month",
      icon: <Users size={26} className="text-[#7866FA]" />,
      growth: "+4.8%",
      onClick: () => router.push("/admin/students"),
    },
    {
      id: "batches",
      title: "Active Batches",
      value: activeBatches,
      sub: "Ongoing right now",
      icon: <Layers size={26} className="text-[#7866FA]" />,
      growth: "+1",
      onClick: () => router.push("/admin/batches"),
    },
    {
      id: "tasks",
      title: "Total Tasks",
      value: tasksTotal,
      sub: "Created by instructors",
      icon: <ClipboardList size={26} className="text-[#7866FA]" />,
      growth: "+2.4%",
      onClick: () => router.push("/admin/tasks/all"),
    },
    {
      id: "sessions",
      title: "Live Sessions (Week)",
      value: sessionsThisWeek,
      sub: "Scheduled this week",
      icon: <Video size={26} className="text-[#7866FA]" />,
      growth: "+2",
      onClick: () => router.push("/admin/tasks/all"),
    },
  ];

  // ---- Charts (kept from your version) ----
  const barOptions = {
    chart: { type: "bar", toolbar: { show: false }, foreColor: "#999" },
    grid: { borderColor: "#eee" },
    colors: ["#9380FD", "#7866FA"],
    dataLabels: { enabled: false },
    xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  };
  const barSeries = [
    { name: "Students", data: [30, 45, 60, 80, 100, 75, 40] },
    { name: "Tasks", data: [20, 35, 28, 50, 60, 45, 25] },
  ];
  const radialOptions = {
    chart: { type: "radialBar", sparkline: { enabled: true } },
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time overview of activity, sessions, and progress.
          </p>
        </div>
        <select className="mt-4 md:mt-0 bg-white border text-gray-700 rounded-lg px-4 py-2 shadow-sm cursor-pointer">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* 🔔 Upcoming Live Session (Banner) */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <CalendarDays size={22} />
            </div>
            <div>
              <p className="text-sm opacity-90">Upcoming Live Session</p>
              {nextSession ? (
                <>
                  <h3 className="text-lg font-semibold">
                    {nextSession.topic} — <span className="opacity-90">{nextSession.batch}</span>
                  </h3>
                  <p className="text-sm opacity-90">
                    {new Date(nextSession.date).toLocaleDateString()} • {nextSession.time}
                    {nextSession.recurring ? " • Weekly" : ""}
                  </p>
                </>
              ) : (
                <h3 className="text-lg font-semibold">No sessions today</h3>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {nextSession?.link && (
              <button
                onClick={() => window.open(nextSession.link, "_blank")}
                className="px-4 py-2 rounded-lg cursor-pointer bg-white text-[#5b4df5] font-medium flex items-center gap-2 hover:bg-white/90"
              >
                <ExternalLink size={16} />
                Join
              </button>
            )}
            <button
              onClick={() => router.push("/admin/tasks/all")}
              className="px-4 py-2 rounded-lg bg-white/20 cursor-pointer text-white font-medium hover:bg-white/25"
            >
              Manage
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={card.onClick}
            className="text-left p-6 rounded-2xl bg-white shadow-md hover:shadow-lg transition border border-gray-100"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="p-3 rounded-xl bg-gray-100">{card.icon}</div>
              <span
                className={`text-sm font-medium ${
                  String(card.growth).startsWith("+")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {card.growth}
              </span>
            </div>
            <h3 className="text-2xl font-bold">{card.value}</h3>
            <p className="text-sm text-gray-700">{card.title}</p>
            <span className="text-xs text-gray-400">{card.sub}</span>
          </motion.button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Student & Task Overview
          </h3>
          <Chart options={barOptions} series={barSeries} type="bar" height={320} />
        </motion.div>

        {/* Radial Chart */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Course Completion Rate
          </h3>
          <Chart options={radialOptions} series={radialSeries} type="radialBar" height={280} />
        </motion.div>

        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Insights</h3>
          <ul className="text-sm text-gray-600 space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <Layers size={16} className="text-[#7866FA]" /> {activeBatches} batches active
            </li>
            <li className="flex items-center gap-2">
              <Video size={16} className="text-[#7866FA]" /> {sessionsThisWeek} live sessions scheduled this week
            </li>
            <li className="flex items-center gap-2">
              <Users size={16} className="text-[#7866FA]" /> {studentsTotal} total students
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#7866FA]" /> {assignmentsSubmitted} submissions overall
            </li>
          </ul>
          <button
            onClick={() => router.push("/admin/tasks/all")}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-medium hover:opacity-90 transition"
          >
            View Sessions & Tasks
          </button>
        </motion.div>
      </div>
    </div>
  );
}
