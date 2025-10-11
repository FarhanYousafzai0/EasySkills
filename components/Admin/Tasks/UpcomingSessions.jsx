'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Repeat, Video, Layers, X, Check } from 'lucide-react';

const batches = ['Batch 1','Batch 2','Batch 3'];

const seed = [
  { id:'S-1', batch:'Batch 1', topic:'DL Basics', date:'2025-10-15', time:'20:00', recurring:true, skipNext:false },
  { id:'S-2', batch:'Batch 2', topic:'React Patterns', date:'2025-10-17', time:'18:00', recurring:false, skipNext:false },
];

export default function UpcomingSessions() {
  const [items, setItems] = useState(seed);
  const [form, setForm] = useState({ batch:'', topic:'', date:'', time:'', recurring:false });

  const add = (e)=> {
    e.preventDefault();
    const id = `S-${Math.floor(Math.random()*900)+100}`;
    setItems([{id, ...form, skipNext:false}, ...items]);
    setForm({ batch:'', topic:'', date:'', time:'', recurring:false });
  };

  const toggleSkip = (id)=> {
    setItems(prev => prev.map(s => s.id===id ? {...s, skipNext: !s.skipNext} : s));
  };

  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
      className="p-6 md:p-10 bg-white/70 backdrop-blur-lg border border-gray-200/50 shadow-md rounded-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Video className="text-[#9380FD]"/> Upcoming Classes (Scheduler)
      </h2>

      {/* Add form */}
      <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <select value={form.batch} onChange={(e)=>setForm({...form, batch:e.target.value})}
          required className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
          <option value="">Batch</option>
          {batches.map(b=><option key={b}>{b}</option>)}
        </select>
        <input value={form.topic} onChange={(e)=>setForm({...form, topic:e.target.value})}
          required className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Topic"/>
        <input type="date" value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})}
          required className="border border-gray-300 rounded-lg px-3 py-2"/>
        <input type="time" value={form.time} onChange={(e)=>setForm({...form, time:e.target.value})}
          required className="border border-gray-300 rounded-lg px-3 py-2"/>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.recurring}
            onChange={(e)=>setForm({...form, recurring:e.target.checked})}/>
          <Repeat className="h-4 w-4 text-[#9380FD]"/> Weekly
        </label>
        <div className="md:col-span-5 flex justify-end">
          <button className="bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white px-6 py-2 rounded-lg">Add</button>
        </div>
      </form>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map(s=>(
          <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{s.id}</span>
              {s.recurring && <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1"><Repeat className="h-3 w-3"/> weekly</span>}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{s.topic}</h3>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              <Layers className="h-4 w-4"/> {s.batch}
            </p>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4"/> {new Date(s.date).toLocaleDateString()} — {s.time}
            </p>

            <div className="flex justify-between mt-4">
              <button onClick={()=>toggleSkip(s.id)}
                className={`text-xs px-3 py-1 rounded-lg border ${
                  s.skipNext ? 'border-red-300 text-red-700 bg-red-50' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}>
                {s.skipNext ? 'Skip Next: ON' : 'Skip Next'}
              </button>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">Edit</button>
                <button className="text-xs px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
