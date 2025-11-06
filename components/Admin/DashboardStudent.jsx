"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  Users,
  ClipboardList,
  Video,
  Layers,
  CalendarDays,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import CountUp from "react-countup";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardAdmin() {
  const router = useRouter();
  const { user } = useUser();

  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [items, setItems] = useState([]);
  const [upcomingSession, setUpcomingSession] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------- FETCH DASHBOARD DATA ------------------------- */
  async function loadData() {
    try {
      setLoading(true);
      const [stuRes, batRes, mixRes, upRes] = await Promise.all([
        fetch("/api/admin/student", { cache: "no-store" }),
        fetch("/api/admin/batches", { cache: "no-store" }),
        fetch("/api/admin/alltask&live", { cache: "no-store" }),
        fetch("/api/admin/upcoming-sessions?days=7", { cache: "no-store" }),
      ]);

      const [stu, bat, mix, up] = await Promise.all([
        stuRes.json(),
        batRes.json(),
        mixRes.json(),
        upRes.json(),
      ]);

      if (stu?.success && Array.isArray(stu.data)) setStudents(stu.data);
      if (bat?.success && Array.isArray(bat.data)) setBatches(bat.data);
      if (mix?.success && Array.isArray(mix.data)) setItems(mix.data);

      if (up?.success && up.data?.length) {
        const soonest = up.data[0]?.sessions?.[0];
        if (soonest) setUpcomingSession(soonest);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ------------------------- DERIVED METRICS ------------------------- */
  const studentsTotal = students.length;
  const activeBatches = useMemo(
    () => batches.filter((b) => (b.status || "").toLowerCase() === "active").length,
    [batches]
  );
  const totalTasks = useMemo(
    () => items.filter((i) => i.kind === "task").length,
    [items]
  );
  const sessionsThisWeek = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7;
    const start = new Date(now);
    start.setDate(now.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    end.setHours(0, 0, 0, 0);

    return items.filter((i) => {
      if (i.kind !== "live") return false;
      const dt = new Date(i.date);
      return dt >= start && dt < end && (i.status || "").toLowerCase() === "scheduled";
    }).length;
  }, [items]);

  const assignmentsSubmitted = useMemo(() => {
    return items.filter(
      (i) => i.kind === "task" && (i.status || "").toLowerCase() === "completed"
    ).length;
  }, [items]);

  /* ------------------------- CHARTS ------------------------- */
  const weekdayIndex = (dateLike) => {
    const js = new Date(dateLike).getDay();
    return (js + 6) % 7;
  };
  const tasksByDay = useMemo(() => {
    const counts = Array(7).fill(0);
    items.forEach((i) => {
      if (i.kind === "task" && i.due) counts[weekdayIndex(i.due)] += 1;
    });
    return counts;
  }, [items]);

  const barOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    grid: { borderColor: "#eee" },
    colors: ["#7866FA"],
    dataLabels: { enabled: false },
    xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  };
  const barSeries = [{ name: "Tasks", data: tasksByDay }];

  const radialOptions = {
    chart: { type: "radialBar", sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: "60%" },
        dataLabels: {
          name: { show: true, fontSize: "14px", color: "#666" },
          value: { fontSize: "22px", color: "#7866FA", fontWeight: 600 },
        },
      },
    },
    labels: ["Completion Rate"],
    colors: ["#9380FD"],
  };
  const radialSeries = useMemo(() => {
    const completed = assignmentsSubmitted || 0;
    const total = totalTasks || 1;
    return [Math.round((completed / total) * 100)];
  }, [assignmentsSubmitted, totalTasks]);

  /* ------------------------- TIME FORMATTER ------------------------- */
  const formatPakistanTime = (date, time) => {
    try {
      const baseDate = new Date(date);
      const [h, m] = (time || "00:00").split(":").map(Number);
      baseDate.setHours(h, m);
      return baseDate.toLocaleString("en-PK", {
        timeZone: "Asia/Karachi",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        month: "short",
        day: "numeric",
      });
    } catch {
      return `${date} ${time}`;
    }
  };

  /* ------------------------- UI ------------------------- */
  const cards = [
    {
      title: "Total Students",
      value: studentsTotal,
      sub: "Enrolled overall",
      icon: <Users size={22} />,
      color: "bg-blue-100",
      text: "text-blue-600",
      onClick: () => router.push("/admin/students"),
    },
    {
      title: "Live Sessions",
      value: sessionsThisWeek,
      sub: "This week",
      icon: <Video size={22} />,
      color: "bg-purple-100",
      text: "text-purple-600",
      onClick: () => router.push("/admin/tasks"),
    },
    {
      title: "Total Tasks",
      value: totalTasks,
      sub: "Created by instructors",
      icon: <ClipboardList size={22} />,
      color: "bg-green-100",
      text: "text-green-600",
      onClick: () => router.push("/admin/tasks"),
    },
    {
      title: "Active Batches",
      value: activeBatches,
      sub: "Currently running",
      icon: <Layers size={22} />,
      color: "bg-yellow-100",
      text: "text-yellow-600",
      onClick: () => router.push("/admin/batches"),
    },
  ];

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
        Welcome, {user?.firstName || "Admin"}
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Real-time insights on student progress and sessions.
      </p>

      {/* Upcoming Live Session */}
      {upcomingSession ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 rounded-2xl bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] p-6 flex justify-between items-center shadow-lg text-white"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <CalendarDays size={28} />
            </div>
            <div>
              <p className="text-sm opacity-90 mb-1">Upcoming Live Session</p>
              <>
                <h3 className="text-lg font-semibold">{upcomingSession.topic} — {upcomingSession.batch}</h3>
                <p className="text-xl opacity-90">
                  {formatPakistanTime(upcomingSession.date, upcomingSession.time)}
                </p>
                <p className="text-sm mt-1 font-semibold">
                  {upcomingSession.status === "active" ? "🟢 On-Going" : "🕒 Scheduled"}
                </p>
              </>
            </div>
          </div>
          {upcomingSession?.meetingLink && (
            <button
              onClick={() => window.open(upcomingSession.meetingLink, "_blank")}
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 cursor-pointer rounded-lg font-medium transition"
            >
              Join Session
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-8 rounded-2xl bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] shadow-md text-white flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl flex items-center justify-center">
              <CalendarDays size={28} />
            </div>
            <div className="text-left">
              <p className="text-sm opacity-80 mb-1">Upcoming Live Session</p>
              <h3 className="text-lg font-semibold">No upcoming sessions</h3>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            onClick={c.onClick}
            className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 cursor-pointer hover:shadow-xl transition"
          >
            <div className="flex gap-3 items-center ">
              <div className={`p-3 rounded-xl ${c.color}`}>{c.icon}</div>
              <span className="text-xs font-medium text-gray-500">{c.sub}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              <CountUp end={c.value} duration={1.25} />
            </h3>
            <p className="text-sm text-gray-600 mt-1">{c.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Task Overview
          </h3>
          <Chart options={barOptions} series={barSeries} type="bar" height={300} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Completion Rate
          </h3>
          <Chart options={radialOptions} series={radialSeries} type="radialBar" height={280} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Trend
          </h3>
          <Chart
            options={{
              chart: { type: "line", toolbar: { show: false } },
              stroke: { curve: "smooth", width: 3 },
              colors: ["#9380FD"],
              xaxis: { categories: ["Week 1", "Week 2", "Week 3", "Week 4"] },
              grid: { borderColor: "#eee" },
            }}
            series={[{ name: "Tasks Completed", data: [10, 20, 30, 40] }]}
            type="line"
            height={300}
          />
        </motion.div>
      </div>
    </div>
  );
}
