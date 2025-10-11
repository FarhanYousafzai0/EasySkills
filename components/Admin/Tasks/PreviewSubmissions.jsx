'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Filter, FileText, User } from 'lucide-react';

const demo = [
  { id:'SUB-1', student:'Ali Khan', batch:'Batch 1', task:'Week 2 Worksheet', submittedAt:'2025-10-12', status:'pending', link:'#' },
  { id:'SUB-2', student:'Sara Malik', batch:'Batch 2', task:'Git Basics Quiz', submittedAt:'2025-10-11', status:'pending', link:'#' },
];

const batches = ['All','Batch 1','Batch 2','Batch 3'];

export default function PreviewSubmissions() {
  const [items, setItems] = useState(demo);
  const [batch, setBatch] = useState('All');

  const filtered = items.filter(i => batch==='All' || i.batch===batch);

  const mark = (id, status) => {
    setItems(prev => prev.map(i => i.id===id ? {...i, status} : i));
  };

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
      className="p-6 md:p-10 bg-white/70 backdrop-blur-lg border border-gray-200/50 shadow-md rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-[#9380FD]"/> Preview Submissions
        </h2>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <Filter size={16} className="text-gray-600"/>
          <select value={batch} onChange={(e)=>setBatch(e.target.value)}
            className="bg-transparent text-sm">
            {batches.map(b=><option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(s=>(
          <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-gray-500">{s.id}</div>
            <h3 className="text-lg font-semibold text-gray-900 mt-1 flex items-center gap-2">
              <User className="h-4 w-4 text-[#7866FA]"/>{s.student}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Batch: {s.batch}</p>
            <p className="text-sm text-gray-600">Task: {s.task}</p>
            <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(s.submittedAt).toLocaleDateString()}</p>
            <a href={s.link} className="text-sm text-[#7866FA] underline mt-2 inline-block">Open submission</a>

            <div className="flex justify-between items-center mt-4">
              <span className={`text-xs px-2 py-1 rounded-full ${s.status==='approved'?'bg-emerald-100 text-emerald-700': s.status==='changes'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-700'}`}>
                {s.status}
              </span>
              <div className="flex gap-2">
                <button onClick={()=>mark(s.id,'approved')}
                  className="text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"><CheckCircle2 size={14}/> Approve</button>
                <button onClick={()=>mark(s.id,'changes')}
                  className="text-xs px-3 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1"><XCircle size={14}/> Changes</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
