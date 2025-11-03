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
  Clock,
} from "lucide-react";
import CountUp from "react-countup";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ─────────────────────────────── helpers ─────────────────────────────── */
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

/* ─────────────────────────────── component ─────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [items, setItems] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  /* ───────── fetch core data ───────── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [stuRes, batRes, mixRes] = await Promise.all([
          fetch("/api/admin/student", { cache: "no-store" }),
          fetch("/api/admin/batches", { cache: "no-store" }),
          fetch("/api/admin/alltask&live", { cache: "no-store" }),
        ]);

        const [stu, bat, mix] = await Promise.all([
          stuRes.json(),
          batRes.json(),
          mixRes.json(),
        ]);

        if (stu?.success && Array.isArray(stu.data)) setStudents(stu.data);
        if (bat?.success && Array.isArray(bat.data)) setBatches(bat.data);
        if (mix?.success && Array.isArray(mix.data)) setItems(mix.data);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ───────── fetch upcoming live sessions ───────── */
  useEffect(() => {
    (async () => {
      try {
        setLoadingUpcoming(true);
        const res = await fetch("/api/admin/upcoming-sessions?days=7", {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setUpcoming(data.data);
      } catch (err) {
        console.error("Error fetching upcoming sessions:", err);
      } finally {
        setLoadingUpcoming(false);
      }
    })();
  }, []);

  /* ───────── derived metrics ───────── */
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
    return items.filter((i) => i.kind === "task" && (i.status || "").toLowerCase() === "completed").length;
  }, [items]);

  /* ───────── cards setup ───────── */
  const cards = [
    {
      id: "students",
      title: "Total Students",
      value: studentsTotal,
      sub: "Enrolled this month",
      icon: <Users size={26} />,
      growth: "+4.8%",
      onClick: () => router.push("/admin/students"),
    },
    {
      id: "batches",
      title: "Active Batches",
      value: activeBatches,
      sub: "Ongoing right now",
      icon: <Layers size={26} />,
      growth: "+1.2%",
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
      growth: "+3%",
      onClick: () => router.push("/admin/tasks"),
    },
  ];

  /* ───────── chart setup ───────── */
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
    labels: ["Completion"],
    colors: ["#9380FD"],
  };
  const completedTasks = items.filter((i) => i.kind === "task" && (i.status || "").toLowerCase() === "completed").length;
  const radialSeries = [Math.round((completedTasks / (totalTasks || 1)) * 100)];

  const [activeCard, setActiveCard] = useState(null);

  return (
    <div className="w-full p-5 md:p-8 min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Real-time overview of sessions and tasks.</p>
      </div>

      {/* ────── Upcoming Sessions Widget ────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md"
      >
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <CalendarDays size={20} /> Upcoming Live Sessions (Next 7 Days)
        </h2>
        {loadingUpcoming ? (
          <p className="opacity-80">Loading upcoming sessions...</p>
        ) : upcoming.length === 0 ? (
          <p className="opacity-80">No upcoming sessions scheduled.</p>
        ) : (
          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
            {upcoming.map(({ date, sessions }) => (
              <div key={date} className="bg-white/10 p-3 rounded-xl">
                <p className="text-sm font-medium opacity-90 mb-1">
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {sessions.map((s) => (
                  <div
                    key={s._id}
                    className="flex justify-between items-center py-1 border-b border-white/20 last:border-none"
                  >
                    <div>
                      <p className="font-semibold text-white">{s.topic}</p>
                      <p className="text-xs opacity-80 flex items-center gap-1">
                        <Clock size={12} /> {s.time} — {s.batch}
                      </p>
                    </div>
                    {s.meetingLink && (
                      <button
                        onClick={() => window.open(s.meetingLink, "_blank")}
                        className="text-sm bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 flex items-center gap-1"
                      >
                        <ExternalLink size={14} /> Join
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ────── Summary Cards ────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const isActive = activeCard === card.id;
          return (
            <motion.button
              key={card.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveCard(card.id);
                card.onClick?.();
              }}
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
                <CountUp end={Number.isFinite(card.value) ? card.value : 0} duration={1.25} />
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

      {/* ────── Charts Section ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Task Overview</h3>
          <Chart options={barOptions} series={barSeries} type="bar" height={320} />
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Completion</h3>
          <Chart options={radialOptions} series={radialSeries} type="radialBar" height={280} />
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Insights</h3>
          <ul className="text-sm text-gray-600 space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <Layers size={16} className="text-[#7866FA]" /> {activeBatches} active batches
            </li>
            <li className="flex items-center gap-2">
              <Video size={16} className="text-[#7866FA]" /> {sessionsThisWeek} live sessions this week
            </li>
            <li className="flex items-center gap-2">
              <Users size={16} className="text-[#7866FA]" /> {studentsTotal} total students
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#7866FA]" /> {assignmentsSubmitted} task submissions
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
