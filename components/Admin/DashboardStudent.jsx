"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

/* ----------------------------- helpers ----------------------------- */
function combineDateTime(dateLike, hhmm) {
  const d = new Date(dateLike);
  if (!hhmm) return d;
  const [h = "00", m = "00"] = String(hhmm).split(":");
  d.setHours(Number(h), Number(m), 0, 0);
  return d;
}

function getThisWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  end.setHours(0, 0, 0, 0);
  return { start, end };
}

/* ----------------------------- component ----------------------------- */
export default function Dashboard() {
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [items, setItems] = useState([]); // tasks + lives
  const [upcomingSession, setUpcomingSession] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ----------------------------- fetch all data ----------------------------- */
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

      // Extract next upcoming from route
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
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ----------------------------- derived metrics ----------------------------- */
  const studentsTotal = students.length;
  const activeBatches = useMemo(
    () => batches.filter((b) => (b.status || "").toLowerCase() === "active").length,
    [batches]
  );
  const totalTasks = useMemo(
    () => items.filter((i) => i.kind === "task").length,
    [items]
  );
  const { start: weekStart, end: weekEnd } = useMemo(getThisWeekRange, []);
  const sessionsThisWeek = useMemo(() => {
    return items.filter((i) => {
      if (i.kind !== "live") return false;
      const dt = combineDateTime(i.date, i.time);
      return dt >= weekStart && dt < weekEnd && (i.status || "").toLowerCase() === "scheduled";
    }).length;
  }, [items, weekStart, weekEnd]);

  const assignmentsSubmitted = useMemo(() => {
    return items.filter(
      (i) => i.kind === "task" && (i.status || "").toLowerCase() === "completed"
    ).length;
  }, [items]);

  /* ----------------------------- charts ----------------------------- */
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
    chart: { type: "bar", toolbar: { show: false }, foreColor: "#999" },
    grid: { borderColor: "#eee" },
    colors: ["#9380FD", "#7866FA"],
    dataLabels: { enabled: false },
    xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  };
  const barSeries = [
    { name: "Students", data: [30, 45, 60, 80, 100, 75, 40] },
    { name: "Tasks", data: tasksByDay },
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
  const radialSeries = useMemo(() => {
    const completed =
      items.filter(
        (i) => i.kind === "task" && (i.status || "").toLowerCase() === "completed"
      ).length || 0;
    const total = totalTasks || 1;
    const pct = Math.round((completed / total) * 100);
    return [Math.max(0, Math.min(100, pct))];
  }, [items, totalTasks]);

  /* ----------------------------- cards ----------------------------- */
  const cards = [
    {
      id: "students",
      title: "Total Students",
      value: studentsTotal,
      sub: "Enrolled this month",
      icon: <Users size={26} />,
      growth: "+4.8%",
      onClick: () => router.push("/admin/students"),
      format: true,
    },
    {
      id: "batches",
      title: "Active Batches",
      value: activeBatches,
      sub: "Ongoing right now",
      icon: <Layers size={26} />,
      growth: activeBatches > 0 ? "+1" : "0",
      onClick: () => router.push("/admin/batches"),
    },
    {
      id: "tasks",
      title: "Total Tasks",
      value: totalTasks,
      sub: "Created by instructors",
      icon: <ClipboardList size={26} />,
      growth: "+2.4%",
      onClick: () => router.push("/admin/tasks"),
    },
    {
      id: "sessions",
      title: "Live Sessions (Week)",
      value: sessionsThisWeek,
      sub: "Scheduled this week",
      icon: <Video size={26} />,
      growth: sessionsThisWeek > 0 ? "+2" : "0",
      onClick: () => router.push("/admin/tasks"),
    },
  ];

  const [activeCard, setActiveCard] = useState(null);

  return (
    <div className="w-full p-5 md:p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time overview of activity, sessions, and progress.
          </p>
        </div>
      </div>

      {/* ✅ Upcoming Live Session */}
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
              {loading ? (
                <h3 className="text-lg font-semibold">Loading…</h3>
              ) : upcomingSession ? (
                <>
                  <h3 className="text-lg font-semibold">
                    {upcomingSession.topic} —{" "}
                    <span className="opacity-90">{upcomingSession.batch}</span>
                  </h3>
                  <p className="text-sm opacity-90">
                    {new Date(upcomingSession.date).toLocaleDateString()} •{" "}
                    {upcomingSession.time}
                    {upcomingSession.recurringWeekly ? " • Weekly" : ""}
                  </p>
                </>
              ) : (
                <h3 className="text-lg font-semibold">No upcoming sessions</h3>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {upcomingSession?.meetingLink && (
              <button
                onClick={() => window.open(upcomingSession.meetingLink, "_blank")}
                className="px-4 py-2 rounded-lg cursor-pointer bg-white text-[#5b4df5] font-medium flex items-center gap-2 hover:bg-white/90"
              >
                <ExternalLink size={16} />
                Join
              </button>
            )}
            <button
              onClick={() => router.push("/admin/tasks")}
              className="px-4 py-2 rounded-lg bg-white/20 cursor-pointer text-white font-medium hover:bg-white/25"
            >
              Manage
            </button>
          </div>
        </div>
      </motion.div>

      {/* ✅ Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const isActive = activeCard === card.id;
          return (
            <motion.button
              key={card.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCard(card.id)}
              className={`text-left p-6 rounded-2xl transition-all border cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-lg"
                  : "bg-white hover:shadow-lg border-gray-100 text-gray-900"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className={`p-3 rounded-xl ${isActive ? "bg-white/20" : "bg-gray-100"}`}>
                  {React.cloneElement(card.icon, {
                    className: isActive ? "text-white" : "text-[#7866FA]",
                  })}
                </div>
                <span
                  className={`text-sm font-medium ${
                    String(card.growth).startsWith("+")
                      ? isActive
                        ? "text-white"
                        : "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {card.growth}
                </span>
              </div>
              <h3 className={`text-2xl font-bold ${isActive ? "text-white" : ""}`}>
                <CountUp
                  end={Number.isFinite(card.value) ? card.value : 0}
                  duration={1.25}
                  separator={card.format ? "," : ""}
                  preserveValue
                />
              </h3>
              <p className={`text-sm ${isActive ? "text-white/90" : "text-gray-700"}`}>
                {card.title}
              </p>
              <span className={`text-xs ${isActive ? "text-white/60" : "text-gray-400"}`}>
                {card.sub}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ✅ Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Student & Task Overview
          </h3>
          <Chart options={barOptions} series={barSeries} type="bar" height={320} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Course Completion Rate
          </h3>
          <Chart options={radialOptions} series={radialSeries} type="radialBar" height={280} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Insights</h3>
          <ul className="text-sm text-gray-600 space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <Layers size={16} className="text-[#7866FA]" />
              <CountUp end={activeBatches} duration={1} /> batches active
            </li>
            <li className="flex items-center gap-2">
              <Video size={16} className="text-[#7866FA]" />
              <CountUp end={sessionsThisWeek} duration={1} /> live sessions this week
            </li>
            <li className="flex items-center gap-2">
              <Users size={16} className="text-[#7866FA]" />
              <CountUp end={studentsTotal} duration={1.25} separator="," /> total students
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#7866FA]" />
              <CountUp end={assignmentsSubmitted} duration={1.25} separator="," /> submissions overall
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
