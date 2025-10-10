
'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'How can I join the mentorship program?',
      answer:
        'You can apply directly from the website by clicking the "Get Started" button on our homepage. Once you submit your application, our team will reach out within 24 hours with next steps.',
    },
    {
      question: 'Do I need experience to start the YouTube program?',
      answer:
        'No prior experience is required! Our program is built for beginners as well as existing creators looking to scale. You will receive one-on-one guidance from our mentors throughout the process.',
    },
    {
      question: 'Is the training program refundable?',
      answer:
        "We offer a 7-day satisfaction guarantee. If you feel the program isn't right for you, you can request a full refund within the first week.",
    },
    {
      question: 'Can I access the materials after completion?',
      answer:
        'Yes! All participants receive lifetime access to course materials, updates, and new modules added in the future.',
    },
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="min-h-screen w-[95%] mx-auto mt-15 py-24 px-6 flex flex-col items-center justify-center text-center">
      <div className="max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-sm uppercase tracking-wider text-gray-900 font-semibold mb-2"
        >
          Trusted By
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-black mb-10"
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="space-y-5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl overflow-hidden transition-all duration-300 shadow-md ${
                  isOpen ? 'bg-white' : 'bg-white/20 backdrop-blur-md'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left text-gray-900 focus:outline-none"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold text-lg">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"
                  >
                    {isOpen ? (
                      <X className="w-5 h-5 text-gray-700" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-700" />
                    )}
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: 'auto', 
                        opacity: 1
                      }}
                      exit={{ 
                        height: 0, 
                        opacity: 0
                      }}
                      transition={{
                        duration: 0.4,
                        ease: [0.04, 0.62, 0.23, 0.98]
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-4 text-gray-700 text-base leading-relaxed border-t border-gray-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}