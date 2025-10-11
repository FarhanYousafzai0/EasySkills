'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, Layers } from 'lucide-react';

export default function UpcomingWidget({ role = 'admin', sessions = [] }) {
  const items = sessions.slice(0,3);

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
      className="rounded-2xl border border-gray-200/50 bg-white/70 backdrop-blur-lg p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Calendar className="text-[#9380FD]"/> {role==='admin' ? 'Upcoming Classes' : 'Your Upcoming Classes'}
      </h3>
      {items.length===0 ? (
        <p className="text-sm text-gray-500">No sessions scheduled.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((s)=>(
            <li key={s.id} className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Video className="h-4 w-4 text-[#7866FA]"/> {s.topic}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-2 mt-0.5">
                  <Layers className="h-3 w-3"/> {s.batch} • {new Date(s.date).toLocaleDateString()} — {s.time}
                </p>
              </div>
              {s.recurring && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">weekly</span>}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
