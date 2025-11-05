'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import CountUp from 'react-countup';
import { useUser } from '@clerk/nextjs';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  MessageSquareWarning,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DashboardStudent() {
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch student dashboard data
  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/student/dashboard?clerkId=${user.id}`, {
          cache: 'no-store',
        });
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        } else toast.error(result.message || 'Failed to load dashboard.');
      } catch (err) {
        toast.error('Server error loading dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // 🔸 If loading → show skeleton placeholders
  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-gray-50 min-h-screen space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-52 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  // 🔹 Metrics
  const cards = [
    {
      title: 'Pending Tasks',
      value: data.pendingTasks ?? 0,
      sub: 'Awaiting Submission',
      icon: <ClipboardList size={22} />,
      color: 'bg-yellow-100',
      text: 'text-yellow-600',
    },
    {
      title: 'Completed Tasks',
      value: data.completedTasks ?? 0,
      sub: `of ${data.totalTasks ?? 0} total`,
      icon: <CheckCircle size={22} />,
      color: 'bg-green-100',
      text: 'text-green-600',
    },
    {
      title: 'Mentorship Days Left',
      value: data.mentorshipDaysLeft ?? 0,
      sub: 'in your program',
      icon: <Clock size={22} />,
      color: 'bg-blue-100',
      text: 'text-blue-600',
    },
    {
      title: 'Issues Reported',
      value: 0,
      sub: 'Reported to Admin',
      icon: <MessageSquareWarning size={22} />,
      color: 'bg-red-100',
      text: 'text-red-600',
    },
  ];

  const nextSession = data.upcomingSession;

  // 🔸 Chart configurations
  const weeklyActivity = data.charts?.weeklyActivity || { labels: [], data: [] };
  const gradeTrend = data.charts?.gradeTrend || { labels: [], data: [] };

  const weeklyOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    colors: ['#7866FA'],
    xaxis: { categories: weeklyActivity.labels },
    grid: { borderColor: '#eee' },
  };
  const weeklySeries = [{ name: 'Tasks Completed', data: weeklyActivity.data }];

  const gradeOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#7866FA'],
    xaxis: { categories: gradeTrend.labels },
    grid: { borderColor: '#eee' },
  };
  const gradeSeries = [{ name: 'Grades', data: gradeTrend.data }];

  const progressOptions = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: '60%' },
        dataLabels: {
          name: { show: true, fontSize: '14px', color: '#666' },
          value: { fontSize: '22px', color: '#7866FA', fontWeight: 600 },
        },
      },
    },
    labels: ['Overall Progress'],
    colors: ['#9380FD'],
  };

  const progressSeries = [
    data.totalTasks ? (data.completedTasks / data.totalTasks) * 100 : 0,
  ];

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Student Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        Track your progress, sessions, and upcoming events.
      </p>

      {/* Live Session */}
      {nextSession ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-center md:text-left flex-1">
              <p className="text-sm opacity-90 mb-2 uppercase tracking-wide">
                Next Live Session
              </p>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">
                {nextSession.topic} — {nextSession.batch}
              </h3>
              <p className="text-sm opacity-90">
                {new Date(nextSession.date).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => window.open(nextSession.meetingLink, '_blank')}
              className="px-5 py-2.5 rounded-lg bg-white text-[#5b4df5] font-semibold hover:bg-white/90 transition shadow-sm"
            >
              Join Session →
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl bg-white shadow-md border border-gray-100 text-gray-700"
        >
          <p>No upcoming sessions for your batch.</p>
        </motion.div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 cursor-default hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center mb-3">
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
            Weekly Task Activity
          </h3>
          <Chart options={weeklyOptions} series={weeklySeries} type="bar" height={300} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Overall Progress
          </h3>
          <Chart options={progressOptions} series={progressSeries} type="radialBar" height={280} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Grade Trend
          </h3>
          <Chart options={gradeOptions} series={gradeSeries} type="line" height={300} />
        </motion.div>
      </div>
    </div>
  );
}
