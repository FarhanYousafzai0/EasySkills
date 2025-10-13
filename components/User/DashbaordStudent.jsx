'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import CountUp from 'react-countup';
import {
  ClipboardList,
  Layers,
  Video,
  Trophy,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DashboardStudent() {
  const [progress] = useState(68);
  const [tasksCompleted] = useState(24);
  const [totalTasks] = useState(35);
  const [sessions] = useState(5);
  const [rank] = useState(12);

  // Charts
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
        dataLabels: { value: { fontSize: '20px' } },
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
  };

  const cards = [
    {
      title: 'Completed Tasks',
      value: tasksCompleted,
      sub: `of ${totalTasks} total`,
      icon: <CheckCircle size={24} />,
    },
    {
      title: 'Live Sessions',
      value: sessions,
      sub: 'This Week',
      icon: <Video size={24} />,
    },
    {
      title: 'Rank',
      value: rank,
      sub: 'In Leaderboard',
      icon: <Trophy size={24} />,
    },
    {
      title: 'Progress',
      value: progress,
      sub: '% Course Completion',
      icon: <TrendingUp size={24} />,
    },
  ];

  return (
    <div className="p-5 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Overview of your learning progress, tasks, and upcoming sessions.
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.04 }}
            className="p-6 bg-white rounded-2xl shadow-md cursor-pointer border border-gray-100 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#9380FD]/10 to-[#7866FA]/10">
                {React.cloneElement(c.icon, { className: 'text-[#7866FA]' })}
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
