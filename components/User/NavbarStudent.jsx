'use client';

import React from 'react';
import Image from 'next/image';
import { Bell, Search, Menu } from 'lucide-react';

export default function NavbarStudent({ toggleSidebar }) {
  return (
    <div className="flex justify-between mt-5 border items-center bg-white shadow-sm p-4 md:p-3 rounded-xl mb-6">
      <button
        className="md:hidden p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
        onClick={toggleSidebar}
      >
        <Menu size={22} className="text-gray-700" />
      </button>

      <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg w-full md:w-1/3">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks or sessions..."
          className="bg-transparent outline-none w-full text-sm text-gray-700"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
          <Bell size={20} className="text-gray-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#9380FD] rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden">
            <Image
              src="/Haseeb1.jpeg"
              alt="Student"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800">Hassan Ahmed</p>
            <p className="text-xs text-gray-500">Student</p>
          </div>
        </div>
      </div>
    </div>
  );
}
