'use client'

import React, { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { motion } from 'framer-motion'
import { Calendar, Layers } from 'lucide-react'

export default function AddBatch() {
  const [selectedRange, setSelectedRange] = useState()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !selectedRange) return alert('Please fill out all required fields!')
    console.log({
      title,
      description,
      startDate: selectedRange?.from,
      endDate: selectedRange?.to,
    })
    alert('Batch Created Successfully 🎉')
  }

  const handleReset = () => {
    setTitle('')
    setDescription('')
    setSelectedRange(undefined)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-md p-6 md:p-10 w-full mt-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Layers className="text-[#9380FD]" size={26} />
        <h2 className="text-2xl font-bold text-gray-800">Add New Batch</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side - Form Inputs */}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">Batch Title *</label>
          <input
            type="text"
            placeholder="e.g. AI Bootcamp Batch 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-[#9380FD]"
          />

          <label className="block text-gray-700 text-sm font-semibold mb-1">Description</label>
          <textarea
            rows="4"
            placeholder="Brief description of this batch..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-[#9380FD]"
          />

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white px-6 py-2.5 rounded-md font-medium shadow-md hover:opacity-90 cursor-pointer"
            >
              Create Batch
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleReset}
              className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              Reset
            </motion.button>
          </div>
        </div>

        {/* Right Side - Date Picker */}
        <div className="bg-gray-50 rounded-xl p-5 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="text-[#9380FD]" size={18} />
            <h3 className="text-gray-800 font-semibold text-sm">Select Batch Duration *</h3>
          </div>

          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={setSelectedRange}
            className="text-gray-700 rounded-lg"
            modifiersClassNames={{
              selected: 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white',
              today: 'font-semibold text-[#7866FA]',
            }}
          />

          {selectedRange?.from && (
            <div className="mt-4 text-sm text-gray-600">
              <p>
                Start: <span className="font-medium text-gray-800">{selectedRange.from.toDateString()}</span>
              </p>
              {selectedRange?.to && (
                <p>
                  End: <span className="font-medium text-gray-800">{selectedRange.to.toDateString()}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </form>
    </motion.section>
  )
}
