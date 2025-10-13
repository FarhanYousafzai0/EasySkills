'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { toolCategories } from '@/lib/data';

export default function ToolsPage() {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return toolCategories;
    const q = search.toLowerCase();
    return toolCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buy Tools</h1>
          <p className="text-gray-600 mt-1">
            Explore professional-grade tools to boost your productivity and creativity.
          </p>
        </div>

        <div className="flex items-center bg-white border rounded-lg shadow-sm mt-4 md:mt-0 w-full md:w-1/3 px-3 py-2">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            className="ml-2 w-full outline-none text-sm text-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCategories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer border border-gray-100 overflow-hidden"
          >
            <Link href={`/student/tools/${cat.id}`}>
              <div className="relative w-full h-48">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                  <h2 className="text-white text-lg font-semibold">{cat.name}</h2>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{cat.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-[#7866FA] text-sm font-medium hover:underline">
                    View Tools →
                  </span>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      window.open('https://wa.me/923001234567', '_blank');
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white text-sm rounded-lg hover:opacity-90 transition cursor-pointer"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-20"
        >
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Categories Found
          </h3>
          <p className="text-gray-500 text-sm">
            Try adjusting your search or check back later for new tool categories.
          </p>
        </motion.div>
      )}
    </div>
  );
}
