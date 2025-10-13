'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { toolCategories } from '@/lib/data';

export default function ToolCategoryPage() {
  const { id } = useParams();
  const category = toolCategories.find((c) => c.id === id);

  if (!category) {
    return (
      <div className="p-10 text-center text-gray-600">
        <h2 className="text-2xl font-semibold mb-2">Category Not Found</h2>
        <p>Return to <Link href="/student/tools" className="text-[#7866FA] underline">Tools Page</Link>.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          <p className="text-gray-600 mt-1 max-w-2xl">{category.description}</p>
        </div>

        <Link
          href="/student/tools"
          className="flex items-center gap-2 text-white "
        >
         <motion.button
                        
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2.5 cursor-pointer shadow-md text-white bg-gradient-to-r from-[#9380FD] to-[#7866FA] hover:-translate-x-3 rounded-md text-[15px] font-medium transition-all duration-300 hover:shadow-md"
                      >
                       <span className='flex items-center gap-2'><ArrowLeft size={20} />Back </span>
                      </motion.button>
        </Link>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {category.tools.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="relative w-full h-44">
              <Image src={tool.img} alt={tool.title} fill className="object-cover" />
            </div>

            <div className="p-5 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{tool.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{tool.desc}</p>

              <button
                onClick={() => window.open('https://wa.me/923001234567', '_blank')}
                className="mt-auto px-4 py-2 bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white text-sm rounded-lg hover:opacity-90 transition cursor-pointer"
              >
                Contact to Buy
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
