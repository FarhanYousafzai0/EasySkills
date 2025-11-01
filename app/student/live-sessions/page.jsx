'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, CalendarDays, Clock, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs'; // to get batch from Clerk metadata

export default function LiveSessionsPage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch sessions dynamically
  useEffect(() => {
    if (!user) return;

    const batch = user?.publicMetadata?.batch;
    if (!batch) {
      toast.error('No batch assigned to your account.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/student/livesessions?batch=${batch}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.success) {
          setSessions(data.data);
        } else {
          toast.error(data.message || 'Failed to fetch sessions.');
        }
      } catch (err) {
        toast.error('Server error fetching sessions.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <>
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Live Sessions</h1>
      <p className="text-gray-600 mb-6">
        Join your upcoming sessions or replay past ones assigned to your batch.
      </p>

      {loading ? (
        <p className="text-gray-500 text-center mt-20">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">No sessions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session, index) => (
            <motion.div
              key={session._id}
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
                  <CalendarDays size={16} className="text-[#7866FA]" />{' '}
                  {new Date(session.date).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} className="text-[#7866FA]" /> {session.time}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle
                    size={16}
                    className={
                      session.status === 'scheduled'
                        ? 'text-yellow-500'
                        : session.status === 'completed'
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }
                  />
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.open(session.meetingLink, '_blank')}
                className={`w-full py-2 rounded-lg font-medium text-white cursor-pointer transition-all shadow-md ${
                  session.status === 'scheduled'
                    ? 'bg-gradient-to-r from-[#9380FD] to-[#7866FA]'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {session.status === 'scheduled' ? (
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
      )}
    </div>
    
    </>
  );
}
