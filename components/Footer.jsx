import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br mt-20  text-gray-800 py-16 px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm p-10 md:p-16 flex flex-col md:flex-row md:justify-between gap-12 border border-gray-100">
        {/* Left Section */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3">
         <Image src="/Logo.svg" alt="logo" width={150} height={150} />
          </div>

          <p className="text-sm text-gray-600">Sign up to receive health tips.</p>

          {/* Email Form */}
         

          <p className="text-xs text-gray-500 max-w-sm">
            By subscribing you agree to our <span className="underline cursor-pointer">Privacy Policy</span> and provide consent to receive updates from our company.
          </p>
        </div>

        {/* Right Links Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
          <div>
            <h3 className="font-semibold mb-3">Care Plans</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-black cursor-pointer">Sexual Health</li>
              <li className="hover:text-black cursor-pointer">Weight Loss</li>
              <li className="hover:text-black cursor-pointer">Travel Kit</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Learn</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-black cursor-pointer">Blogs</li>
              <li className="hover:text-black cursor-pointer">Research & Education</li>
              <li className="hover:text-black cursor-pointer">Certifications</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">About</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-black cursor-pointer">Providers</li>
              <li className="hover:text-black cursor-pointer">About Us</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-black cursor-pointer">FAQ's</li>
              <li className="hover:text-black cursor-pointer">Contact Us</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-black cursor-pointer">Terms & Conditions</li>
              <li className="hover:text-black cursor-pointer">Privacy Policy</li>
              <li className="hover:text-black cursor-pointer">Risk & Benefits</li>
              <li className="hover:text-black cursor-pointer">Telehealth Consent</li>
              <li className="hover:text-black cursor-pointer">Prescription Policy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto text-center mt-10 text-sm text-gray-500 border-t border-gray-200 pt-6">
        © 2025 joey med. All rights reserved.
      </div>
    </footer>
  );
}
