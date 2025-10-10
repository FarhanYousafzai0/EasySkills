"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  ClipboardList,
  FileText,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Students",
      value: "1,284",
      sub: "Enrolled this month",
      color: "bg-gradient-to-r from-[#9380FD] to-[#7866FA]",
      icon: <Users size={28} />,
      growth: "+4.8%",
    },
    {
      title: "Total Tasks",
      value: "392",
      sub: "Created by instructors",
      color: "bg-white",
      icon: <ClipboardList size={28} className="text-[#7866FA]" />,
      growth: "+2.4%",
    },
    {
      title: "Assignments Submitted",
      value: "2,145",
      sub: "Student submissions",
      color: "bg-white",
      icon: <FileText size={28} className="text-[#7866FA]" />,
      growth: "+12.5%",
    },
    {
      title: "Active Courses",
      value: "37",
      sub: "Ongoing this term",
      color: "bg-white",
      icon: <TrendingUp size={28} className="text-[#7866FA]" />,
      growth: "+1.2%",
    },
  ];

  const activityData = [
    { name: "Mon", students: 30, tasks: 20 },
    { name: "Tue", students: 45, tasks: 32 },
    { name: "Wed", students: 60, tasks: 28 },
    { name: "Thu", students: 80, tasks: 40 },
    { name: "Fri", students: 100, tasks: 50 },
    { name: "Sat", students: 75, tasks: 35 },
    { name: "Sun", students: 40, tasks: 25 },
  ];

  const pieData = [
    { name: "Completed", value: 75 },
    { name: "Pending", value: 25 },
  ];

  const COLORS = ["#7866FA", "#E5E7EB"];

  return (
    <div className="w-full p-5 md:p-8">
      {/* Title */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">
            Summary of LMS activity, student progress, and system metrics.
          </p>
        </div>

        <select className="mt-4 md:mt-0 bg-white border text-gray-700 rounded-lg px-4 py-2 shadow-sm cursor-pointer">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl shadow-md ${stat.color} flex flex-col justify-between text-gray-900`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/30 rounded-xl">{stat.icon}</div>
              <span
                className={`text-sm font-medium ${
                  stat.growth.startsWith("+") ? "text-green-500" : "text-red-500"
                }`}
              >
                {stat.growth}
              </span>
            </div>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
            <span className="text-xs text-gray-400 mt-2">{stat.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-md col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Student & Task Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#7866FA" strokeWidth={3} />
              <Line type="monotone" dataKey="tasks" stroke="#999" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Completion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="w-3 h-3 bg-[#7866FA] rounded-full mx-auto mb-1" />
              <p className="text-sm">Completed</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto mb-1" />
              <p className="text-sm">Pending</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
