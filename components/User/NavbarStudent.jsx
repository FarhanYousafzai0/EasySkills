'use client';

import React from 'react';
import Image from 'next/image';
import { Bell, Search, Menu } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

export default function NavbarStudent({ toggleSidebar }) {
  const { user, isSignedIn } = useUser();

  // Fallbacks if Clerk data is not yet loaded
  const userName = user?.fullName || 'Student';
  const userRole = user?.publicMetadata?.role || 'Student';
  const userImage = user?.imageUrl || '/default-avatar.png';

  return (
    <div className="flex justify-between mt-5 border items-center bg-white shadow-sm p-4 md:p-3 rounded-xl mb-6">
      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
        onClick={toggleSidebar}
      >
        <Menu size={22} className="text-gray-700" />
      </button>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg w-full md:w-1/3">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks or sessions..."
          className="bg-transparent outline-none w-full text-sm text-gray-700"
        />
      </div>

      {/* Right Icons + Profile */}
      <div className="flex items-center gap-5">
        {/* Notification Icon */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
          <Bell size={20} className="text-gray-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#9380FD] rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
        <div className="hidden md:block">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      'hidden', // hide duplicate avatar since we show custom one
                  },
                }}
              />
            </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800">
              {isSignedIn ? userName : 'Guest'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {isSignedIn ? userRole : 'Not Signed In'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
