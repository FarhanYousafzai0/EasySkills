"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function YoutubePricing() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      title: '1-on-1 Mentorship',
      monthlyPrice: 199,
      yearlyPrice: 179,
      features: [
        'Weekly Coaching Calls',
        'Personal Channel Review',
        'Monetization Strategy',
        'Video SEO Optimization',
        'Priority Email Support'
      ],
    },
    {
      title: '2-Month Mastery Program',
      monthlyPrice: 499,
      yearlyPrice: 449,
      features: [
        'Complete Channel Setup',
        'Content Strategy Blueprint',
        'Performance Analytics Review',
        'Monetization & Growth Roadmap',
        'Private Community Access'
      ],
    }
  ];

  return (
    <section className="w-[95%] h-screen mx-auto rounded-md mt-20 bg-gradient-to-br from-[#9380FD] via-[#7866FA] to-[#ECCFFE] py-20 text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Simple, Transparent Pricing
        </motion.h2>

        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Choose a plan designed for your YouTube success. No hidden fees—just direct access to mentorship and strategy that works.
        </p>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/20 rounded-full flex p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition ${!isYearly ? 'bg-white text-black' : 'text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition ${isYearly ? 'bg-white text-black' : 'text-white'}`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white text-gray-900 rounded-2xl shadow-xl p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform"
            >
              <div>
                <h3 className="text-2xl font-bold mb-3 text-[#3A2F80]">{plan.title}</h3>
                <p className="text-4xl font-semibold text-black mb-2">
                  ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  <span className="text-gray-500 text-lg font-normal"> USD</span>
                </p>
                <ul className="text-gray-700 space-y-3 mt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#9380FD] rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="mt-8 w-full py-3 rounded-full cursor-pointer text-white font-medium bg-gradient-to-r from-[#9380FD] to-[#7866FA] hover:opacity-90"
              >
                Enroll Now
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
