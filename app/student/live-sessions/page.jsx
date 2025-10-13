'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, CalendarDays, Clock, ExternalLink, CheckCircle } from 'lucide-react';

export default function LiveSessionsPage() {
  const [sessions] = useState([
    {
      id: 'S1',
      topic: 'React Hooks Deep Dive',
      batch: 'Batch 12',
      date: '2025-10-15',
      time: '8:00 PM',
      link: 'https://zoom.us/j/123456789',
      status: 'Upcoming',
    },
    {
      id: 'S2',
      topic: 'Next.js Data Fetching',
      batch: 'Batch 12',
      date: '2025-10-08',
      time: '7:00 PM',
      link: 'https://zoom.us/j/987654321',
      status: 'Completed',
    },
  ]);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Live Sessions</h1>
      <p className="text-gray-600 mb-6">
        Join your upcoming sessions or replay past ones assigned to your batch.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03 }}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#9380FD]/10">
                <Video size={24} className="text-[#7866FA]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {session.topic}
                </h3>
                <p className="text-sm text-gray-500">{session.batch}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700 mb-5">
              <p className="flex items-center gap-2">
                <CalendarDays size={16} className="text-[#7866FA]" /> {session.date}
              </p>
              <p className="flex items-center gap-2">
                <Clock size={16} className="text-[#7866FA]" /> {session.time}
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle
                  size={16}
                  className={
                    session.status === 'Upcoming' ? 'text-yellow-500' : 'text-green-600'
                  }
                />
                {session.status}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.open(session.link, '_blank')}
              className={`w-full py-2 rounded-lg font-medium text-white cursor-pointer transition-all shadow-md ${
                session.status === 'Upcoming'
                  ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA]'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {session.status === 'Upcoming' ? (
                <>
                  <ExternalLink size={16} className="inline mr-2" />
                  Join Session
                </>
              ) : (
                <>
                  <Video size={16} className="inline mr-2" />
                  Watch Replay
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
