'use client'
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const trainers = [
  { name: 'Waleed Ahmed', role: 'Co-founder of EasySkills', color: '#FFFFFF', img: '/Waleed.jpg' },
  { name: 'Farhan Yousafzai', role: 'AI Full-Stack Developer', color: '#ffffff', img: '/Farhan.jpeg' },
  { name: 'Faheem Akhtar', role: 'Technical SEO Expert', color: '#B6F4C2', img: '/dummy3.jpg' },
  { name: 'Ammar Ashfaq', role: 'Content Writing Trainer', color: '#FBE6B3', img: '/dummy4.jpg' },
  { name: 'Haseeb Ali', role: 'Freelance Trainer', color: '#BCE1F8', img: '/Haseeb1.jpeg' },
  { name: 'Umair Shehzad', role: 'Freelance Trainer', color: '#E8C7F9', img: '/dummy6.jpg' },
]

export default function TrainerShowcase() {
  return (
    <section className="w-[95%] mx-auto mt-15 py-20 text-center  bg-gradient-to-br from-[#9380FD] via-[#7866FA] to-[#ECCFFE] rounded-2xl shadow-md">
      {/* Section Heading */}
      <div className="max-w-3xl mx-auto mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-white"
        >
          Meet Our Expert Trainers
        </motion.h2>
        <p className="text-white mt-3 text-[17px]">
          Learn directly from professionals who mastered their skills. Each trainer brings real-world expertise to guide your growth.
        </p>
      </div>

      {/* Trainer Layout */}
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-10">
        {/* Left Side */}
        <div className="flex flex-col gap-8 items-end">
          {trainers.slice(0, 3).map((trainer, i) => (
            <motion.div
              key={trainer.name}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-20 h-20  rounded-full overflow-hidden shadow-md flex items-center justify-center"
                style={{ backgroundColor: trainer.color }}
              >
                <Image
                  src={trainer.img}
                  alt={trainer.name}
                  width={100}
                  height={70}
                  className="rounded-full object-center"
                />
              </div>
              <div className="text-left">
                <h3 className="text-[16px] font-semibold text-white">{trainer.name}</h3>
                <p className="text-sm text-white">{trainer.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Center Trainer */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-72 h-72 rounded-full bg-gradient-to-r from-[#9380FD] to-[#7866FA] flex items-center justify-center shadow-xl"
        >
          <div className="absolute inset-[10px] bg-white rounded-full flex items-center justify-center">
            <div className="w-60 h-60 rounded-full overflow-hidden shadow-md">
              <Image
                src="/Seo.jpg"
                alt="Main Trainer"
                width={240}
                height={240}
                className="object-cover rounded-full"
              />
            </div>
          </div>
          <div className="absolute -bottom-14 text-center w-full">
            <h3 className="text-xl font-bold text-white">Hassan Ali</h3>
            <p className="text-white text-sm">CEO EasySkills</p>
          </div>
        </motion.div>

        {/* Right Side */}
        <div className="flex flex-col gap-8 items-start">
          {trainers.slice(3).map((trainer, i) => (
            <motion.div
              key={trainer.name}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-20 h-20 rounded-full overflow-hidden shadow-md flex items-center justify-center"
                
              >
                <Image
                  src={trainer.img}
                  alt={trainer.name}
                  width={100}
                  height={70}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="text-left">
                <h3 className="text-[16px] font-semibold text-white">{trainer.name}</h3>
                <p className="text-sm text-white">{trainer.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
