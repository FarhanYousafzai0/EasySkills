'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import CountUp from 'react-countup';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Calendar, ClipboardList, CheckCircle, Clock, MessageSquareWarning, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DashboardStudent() {
  const { user } = useUser();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------- FETCH DASHBOARD ------------------------- */
  const loadDashboard = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/student/dashboard?clerkId=${user.id}`, { cache: 'no-store' });
      const result = await res.json();
      if (result.success) setData(result.data);
      else toast.error(result.message || 'Failed to load dashboard.');
    } catch {
      toast.error('Server error loading dashboard.');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- FETCH UPCOMING SESSION ------------------------- */
  const loadUpcoming = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/student/upcoming-sessions?clerkId=${user.id}`, { cache: 'no-store' });
      const result = await res.json();
      if (result.success && result.data) setUpcoming(result.data);
      else setUpcoming(null);
    } catch (err) {
      console.error('Error fetching upcoming session', err);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadUpcoming();
    const interval = setInterval(loadUpcoming, 120000);
    return () => clearInterval(interval);
  }, [user]);

  /* ------------------------- LIVE MENTORSHIP COUNTDOWN ------------------------- */
  useEffect(() => {
    if (!data?.mentorshipEndDate) return;
    const updateDaysLeft = () => {
      const end = new Date(data.mentorshipEndDate);
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
      setData((p) => ({ ...p, mentorshipDaysLeft: daysLeft }));
    };
    updateDaysLeft();
    const interval = setInterval(updateDaysLeft, 86400000);
    return () => clearInterval(interval);
  }, [data?.mentorshipEndDate]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-gray-50 min-h-screen space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
    );
  }

  if (!data) return null;

  const nextSession = upcoming || data.upcomingSession;
  const statusLabel =
    nextSession?.status === 'active' ? 'On-Going' :
    nextSession?.status === 'scheduled' ? ' Scheduled' :
    '';



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
  /* ------------------------- METRIC CARDS ------------------------- */
  const cards = [
    {
      title: 'Mentorship Days Left',
      value: data.mentorshipDaysLeft ?? 0,
      sub: data.mentorshipEndDate
        ? `Ends on ${new Date(data.mentorshipEndDate).toLocaleDateString()}`
        : 'in your program',
      icon: <Clock size={22} />,
      color: 'bg-blue-100',
      onClick: null,
    },
    {
      title: 'Issues Reported',
      value: 0,
      sub: 'Reported to Admin',
      icon: <MessageSquareWarning size={22} />,
      color: 'bg-red-100',
      onClick: () => router.push('/student/report/allreports'),
    },
    {
      title: 'Pending Tasks',
      value: data.pendingTasks ?? 0,
      sub: 'Awaiting Submission',
      icon: <ClipboardList size={22} />,
      color: 'bg-yellow-100',
      onClick: () => router.push('/student/task'),
    },
    {
      title: 'Completed Tasks',
      value: data.completedTasks ?? 0,
      sub: `of ${data.totalTasks ?? 0} total`,
      icon: <CheckCircle size={22} />,
      color: 'bg-green-100',
      onClick: () => router.push('/student/task/submitted'),
    },
  ];

  /* ------------------------- CHARTS ------------------------- */
  const weeklyActivity = data.charts?.weeklyActivity || { labels: [], data: [] };
  const gradeTrend = data.charts?.gradeTrend || { labels: [], data: [] };

  const weeklyOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    colors: ['#7866FA'],
    xaxis: { categories: weeklyActivity.labels },
  };
  const weeklySeries = [{ name: 'Tasks Completed', data: weeklyActivity.data }];

  const gradeOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#7866FA'],
    xaxis: { categories: gradeTrend.labels },
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
  const progressSeries = [data.totalTasks ? (data.completedTasks / data.totalTasks) * 100 : 0];

  /* ------------------------- RENDER ------------------------- */
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Welcome, {data.studentName || 'Student'}
      </h1>
      <p className="text-gray-600 mb-8 text-center">Track your progress, sessions, and upcoming events.</p>

      {/* Upcoming Live Session */}
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
            {nextSession ? (
              <>
                <h3 className="text-lg font-semibold">{nextSession.topic} — {nextSession.batch}</h3>
                <p className="text-xl opacity-90">
                
                 {formatPakistanTime(nextSession.date, nextSession.time)}
                </p>
                <p className="text-sm mt-1 font-semibold">
                {nextSession.status === "active" ? " On-Going" : "Scheduled"}
              </p>
              </>
            ) : (
              <h3 className="text-lg font-semibold">No upcoming sessions</h3>
            )}
          </div>
        </div>
        <button
          onClick={() => nextSession && window.open(nextSession.meetingLink, '_blank')}
          className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 cursor-pointer rounded-lg font-medium transition"
        >
          Join Session 
        </button>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            onClick={() => c.onClick && c.onClick()}
            className={`p-6 bg-white rounded-2xl shadow-md border border-gray-100 transition ${
              c.onClick ? 'cursor-pointer hover:shadow-xl' : ''
            }`}
          >
            <div className="flex  gap-3 items-center mb-3">
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

      {/* Charts (Dynamic-ready) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Task Activity</h3>
          <Chart options={weeklyOptions} series={weeklySeries} type="bar" height={300} />
        </motion.div>

        <motion.div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
          <Chart options={progressOptions} series={progressSeries} type="radialBar" height={280} />
        </motion.div>

        <motion.div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Trend</h3>
          <Chart options={gradeOptions} series={gradeSeries} type="line" height={300} />
        </motion.div>
      </div>
    </div>
  );
}
