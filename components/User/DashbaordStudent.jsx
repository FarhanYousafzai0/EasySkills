'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useUser } from '@clerk/nextjs';
import { CalendarDays, Clock, ClipboardList, CheckCircle, MessageSquareWarning } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DashboardStudent() {
  const { user } = useUser();
  const router = useRouter();

  const [access, setAccess] = useState(null);
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  /* ================================
     LOAD DASHBOARD
  ================================= */
  const loadDashboard = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/student/dashboard?clerkId=${user.id}`, {
        cache: 'no-store',
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.message || "Failed to load dashboard");
        return;
      }

      setAccess(result.access);
      setData(result.data);

    } catch (err) {
      toast.error("Server error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  /* ================================
     LOADING UI
  ================================= */
  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-gray-50 min-h-screen space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
    );
  }

  /* ================================
     MENTORSHIP EXPIRED → FULL LOCK
  ================================= */
  if (access && access.lockReason === "MENTORSHIP_EXPIRED") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white shadow-lg rounded-2xl p-8 max-w-lg text-center border border-gray-200"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Your Mentorship Has Ended
          </h1>
          <p className="text-gray-600 mb-6">
            Please contact support or your admin to renew your mentorship and regain access.
          </p>

          <p className="text-sm text-gray-500 mb-1">
            Days Left: 0
          </p>

          <button
            onClick={() => router.refresh()}
            className="px-6 py-2 cursor-pointer bg-[#7866FA] text-white rounded-lg shadow-md hover:opacity-90"
          >
            Refresh
          </button>
        </motion.div>
      </div>
    );
  }

  /* ================================
     NO DATA
  ================================= */
  if (!data) return null;

  /* ================================
     UPCOMING SESSION
  ================================= */
  const nextSession = data.upcomingSession;

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

  /* ================================
     METRIC CARDS
  ================================= */
  const cards = [
    {
      title: "Mentorship Days Left",
      value: access.mentorshipDaysLeft,
      sub: data.mentorshipEndDate
        ? `Ends on ${new Date(data.mentorshipEndDate).toLocaleDateString()}`
        : "Active",
      icon: <Clock size={22} />,
      color: "bg-blue-100",
      onClick: null,
    },
    {
      title: "Issues Reported",
      value: 0,
      sub: "Reported to Admin",
      icon: <MessageSquareWarning size={22} />,
      color: "bg-red-100",
      onClick: () => router.push("/student/report/allreports"),
    },
    {
      title: "Pending Tasks",
      value: data.pendingTasks,
      sub: "Awaiting Submission",
      icon: <ClipboardList size={22} />,
      color: "bg-yellow-100",
      onClick: () => router.push("/student/task"),
    },
    {
      title: "Completed Tasks",
      value: data.completedTasks,
      sub: `of ${data.totalTasks}`,
      icon: <CheckCircle size={22} />,
      color: "bg-green-100",
      onClick: () => router.push("/student/task/submitted"),
    },
  ];

  /* ================================
     CHART DATA
  ================================= */
  const weeklyActivity = data.charts.weeklyActivity;
  const gradeTrend = data.charts.gradeTrend;

  const weeklyOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    colors: ["#7866FA"],
    xaxis: { categories: weeklyActivity.labels },
  };

  const gradeOptions = {
    chart: { type: "line", toolbar: { show: false } },
    colors: ["#7866FA"],
    stroke: { curve: "smooth", width: 3 },
    xaxis: { categories: gradeTrend.labels },
  };

  const progressOptions = {
    chart: { type: "radialBar", sparkline: { enabled: true } },
    colors: ["#9380FD"],
    plotOptions: {
      radialBar: {
        hollow: { size: "60%" },
        dataLabels: {
          value: { fontSize: "22px", color: "#7866FA", fontWeight: 600 },
        },
      },
    },
    labels: ["Overall Progress"],
  };

  const progressSeries = [
    data.totalTasks
      ? (data.completedTasks / data.totalTasks) * 100
      : 0,
  ];

  /* ================================
     RENDER STUDENT DASHBOARD
  ================================= */
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Welcome, {data.studentName}
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Track your progress, sessions, and upcoming events.
      </p>

      {/* UPCOMING SESSION */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 rounded-2xl bg-gradient-to-r from-[#9E8CFF] to-[#7866FA] p-6 shadow-lg text-white"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Upcoming Live Session</p>

            {nextSession ? (
              <>
                <h3 className="text-lg font-semibold mt-1">
                  {nextSession.topic} — {nextSession.batch}
                </h3>
                <p className="text-xl opacity-90 mt-1">
                  {formatPakistanTime(nextSession.date, nextSession.time)}
                </p>
                <p className="text-sm mt-1 font-semibold">
                  {nextSession.status === "active" ? "On-Going" : "Scheduled"}
                </p>
              </>
            ) : (
              <h3 className="text-lg font-semibold mt-2">
                No upcoming sessions
              </h3>
            )}
          </div>

          {nextSession && (
            <button
              onClick={() => window.open(nextSession.meetingLink, "_blank")}
              className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg transition cursor-pointer"
            >
              Join
            </button>
          )}
        </div>
      </motion.div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className={`p-6 bg-white rounded-2xl shadow-md border border-gray-100 ${
              c.onClick ? "cursor-pointer hover:shadow-xl" : ""
            }`}
            onClick={c.onClick}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-xl ${c.color}`}>{c.icon}</div>
              <span className="text-xs text-gray-500">{c.sub}</span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900">
              <CountUp end={c.value} duration={1.25} />
            </h3>
            <p className="text-sm text-gray-600 mt-1">{c.title}</p>
          </motion.div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Activity */}
        <motion.div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Task Activity
          </h3>
          <Chart options={weeklyOptions} series={[{ data: weeklyActivity.data }]} type="bar" height={300} />
        </motion.div>

        {/* Overall Progress */}
        <motion.div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
          <Chart options={progressOptions} series={progressSeries} type="radialBar" height={260} />
        </motion.div>

        {/* Grade Trend */}
        <motion.div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Trend</h3>
          <Chart options={gradeOptions} series={[{ data: gradeTrend.data }]} type="line" height={300} />
        </motion.div>
      </div>
    </div>
  );
}
