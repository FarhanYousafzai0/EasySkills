'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import CountUp from 'react-countup';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Layers,
  Video,
  TrendingUp,
  CheckCircle,
  CalendarDays,
  ExternalLink,
  Clock,
  MessageSquareWarning,
} from 'lucide-react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DashboardStudent() {
  const router = useRouter();

  // ----- STATE -----
  const [progress] = useState(68);
  const [tasksCompleted] = useState(24);
  const [totalTasks] = useState(35);
  const [sessions] = useState(5);
  const [mentorshipDays] = useState(42);
  const [issuesReported] = useState(2);

  const [upcomingSession] = useState({
    topic: 'Next.js API Integration',
    batch: 'Batch 12',
    date: '2025-10-16',
    time: '8:00 PM',
    link: 'https://zoom.us/j/123456789',
  });

  const pendingTasks = totalTasks - tasksCompleted;

  // ----- CHART DATA -----
  const weeklySeries = [{ name: 'Tasks Completed', data: [3, 5, 6, 4, 7, 8, 6] }];
  const weeklyOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    colors: ['#7866FA'],
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    grid: { borderColor: '#eee' },
  };

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
  const progressSeries = [progress];

  const lineSeries = [
    { name: 'Grades', data: [78, 82, 88, 90, 93, 97, 95] },
  ];
  const lineOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#7866FA'],
    xaxis: { categories: ['Week 1', '2', '3', '4', '5', '6', '7'] },
    grid: { borderColor: '#eee' },
  };

  // ----- CARDS -----
  const cards = [
   
    {
      title: 'Pending Tasks',
      value: pendingTasks,
      sub: 'Awaiting Submission',
      icon: <ClipboardList size={22} />,
      color: 'bg-yellow-100',
      text: 'text-yellow-600',
      link: '/student/tasks',
    },
    {
        title: 'Completed Tasks',
        value: tasksCompleted,
        sub: `of ${totalTasks} total`,
        icon: <CheckCircle size={22} />,
        color: 'bg-green-100',
        text: 'text-green-600',
        link: '/student/tasks',
      },
    {
      title: 'Mentorship Days Left',
      value: mentorshipDays,
      sub: 'in your program',
      icon: <Clock size={22} />,
      color: 'bg-blue-100',
      text: 'text-blue-600',
      link: '/student/dashboard',
    },
    {
      title: 'Issues Reported',
      value: issuesReported,
      sub: 'Reported to Admin',
      icon: <MessageSquareWarning size={22} />,
      color: 'bg-red-100',
      text: 'text-red-600',
      link: '/student/report',
    },
  ];

  // ----- UPCOMING SESSION -----
  const nextSession = useMemo(() => upcomingSession, [upcomingSession]);

  return (
    <div className="p-5 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Track your progress, live sessions, and pending work.
      </p>

      {/* 🔔 Upcoming Live Session Banner */}
      <motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  className="mb-8 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-md"
>
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
    {/* LEFT — Session Info */}
    <div className="text-white text-center md:text-left w-full md:w-auto flex-1">
      <p className="text-sm opacity-90 mb-2 uppercase tracking-wide text-center md:text-left">
        Next Live Session
      </p>

      {nextSession ? (
        <>
          {/* Topic + Batch */}
          <h3 className="text-xl md:text-2xl font-semibold mb-4 leading-snug text-center md:text-left">
            {nextSession.topic}{' '}
            <span className="opacity-90 text-white/80">— {nextSession.batch}</span>
          </h3>

          {/* Date + Time */}
          <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-3">
            <span className="text-2xl sm:text-3xl font-medium text-white/90">
              {new Date(nextSession.date).toLocaleDateString('en-US', {
                weekday: 'long', // e.g. Thursday
                month: 'short',  // e.g. Oct
                day: 'numeric',  // e.g. 16
              })}
            </span>

            <strong className="text-5xl sm:text-6xl font-bold tracking-tight text-white">
              {nextSession.time}
            </strong>
          </div>
        </>
      ) : (
        <h3 className="text-lg font-semibold text-center md:text-left text-white">
          No sessions scheduled
        </h3>
      )}
    </div>

    {/* RIGHT — Join Button */}
    {nextSession?.link && (
      <div className="flex justify-center md:justify-end w-full md:w-auto">
        <button
          onClick={() => window.open(nextSession.link, '_blank')}
          className="px-5 py-2.5 rounded-lg cursor-pointer bg-white text-[#5b4df5] font-semibold flex items-center gap-2 hover:bg-white/90 transition shadow-sm"
        >
          Join Session →
        </button>
      </div>
    )}
  </div>
</motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.04 }}
            onClick={() => router.push(c.link)}
            className="p-6 bg-white rounded-2xl shadow-md cursor-pointer border border-gray-100 hover:shadow-xl transition"
          >
            <div className="flex justify-between items-center mb-3">
              <div className={`p-3 rounded-xl ${c.color}`}>
                {React.cloneElement(c.icon, { className: `${c.text}` })}
              </div>
              <span className="text-xs font-medium text-gray-500">{c.sub}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              <CountUp end={c.value} duration={1.25} />
            </h3>
            <p className="text-sm text-gray-600 mt-1">{c.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
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
          <Chart options={lineOptions} series={lineSeries} type="line" height={300} />
        </motion.div>
      </div>
    </div>
  );
}
