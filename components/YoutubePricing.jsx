"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function YoutubePricing() {
  const plans = [
    {
      title: "1-on-1 Mentorship",
      price: 200,
      description:
        "Direct personal mentorship tailored to you. Ideal for students who want fast, personalized growth.",
      features: [
        "Weekly 1-on-1 Coaching Calls",
        "Personal Channel Audit",
        "Custom Monetization Strategy",
        "YouTube SEO Optimization",
        "Unlimited Voice Notes Support",
      ],
    },
    {
      title: "Group Mentorship (30-Day Program)",
      price: 300,
      description:
        "A structured 30-day transformation program with group support, weekly tasks, and community growth.",
      features: [
        "Weekly Group Zoom Sessions",
        "Full Channel Setup Guidance",
        "Content & SEO Strategy",
        "Community Q/A Support",
        "Weekly Assignments & Tracking",
      ],
    },
  ];

  return (
    <section
      className="w-[95%] min-h-screen mx-auto rounded-md mt-20 
      bg-gradient-to-br from-[#9380FD] via-[#7866FA] to-[#ECCFFE] 
      py-20 text-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Choose Your Mentorship Plan
        </motion.h2>

        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          Select a program designed to accelerate your YouTube automation journey.
          Every plan includes structured guidance and clear direction.
        </p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white text-gray-900 rounded-2xl shadow-xl p-8 
                flex flex-col justify-between hover:scale-[1.02] transition-transform"
            >
              <div>
                {/* Title */}
                <h3 className="text-2xl font-bold mb-2 text-[#3A2F80]">
                  {plan.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4">{plan.description}</p>

                {/* Price */}
                <p className="text-4xl font-semibold text-black mb-2">
                  ${plan.price}
                  <span className="text-gray-500 text-lg font-normal"> USD</span>
                </p>

                {/* Features */}
                <ul className="text-gray-700 space-y-3 mt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#9380FD] rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="mt-10 w-full py-3 rounded-md cursor-pointer text-white font-medium 
                bg-gradient-to-r from-[#9380FD] to-[#7866FA] hover:opacity-90"
              >
                <span className="flex items-center justify-center gap-2">
                  Enroll Now <ArrowRight size={20} />
                </span>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
