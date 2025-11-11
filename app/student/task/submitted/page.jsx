'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Award,
  Loader2,
  FileText,
  ExternalLink,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function SubmittedTasksPage() {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/student/submit-task?clerkId=${user.id}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) setSubmissions(data.data || []);
      else toast.error(data.message || 'Error fetching submitted tasks');
    } catch {
      toast.error('Server error fetching submissions.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchSubmissions();
  }, [user, fetchSubmissions]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 size={32} className="text-[#7866FA] animate-spin" />
      </div>
    );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Submitted Tasks</h1>
      <p className="text-gray-600 mb-8">
        Review your submissions, grades, and feedback from mentors.
      </p>

      {submissions.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <FileText className="mx-auto mb-3 text-gray-400" size={40} />
          No submitted tasks yet.
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-2">
          {submissions.map((task, i) => {
            const feedbacks = Array.isArray(task.feedback) ? task.feedback : [];
            const latestFeedback = feedbacks.at(-1);

            return (
              <motion.div
                key={task._id || i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 flex flex-col justify-between"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle2
                        size={18}
                        className={
                          task.status === 'graded'
                            ? 'text-green-500'
                            : task.status === 'changes'
                            ? 'text-amber-500'
                            : 'text-[#7866FA]'
                        }
                      />
                      {task.taskTitle}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted {new Date(task.submittedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                        task.status === 'graded'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'changes'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-[#9380FD]/10 text-[#7866FA]'
                      }`}
                    >
                      {task.status}
                    </span>
                    <div className="flex items-center gap-1 justify-end mt-2 text-sm font-medium text-gray-800">
                      <Award size={16} className="text-yellow-500" />
                      Score: {task.score ?? '-'}
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <p className="text-sm text-gray-700 mb-3">
                  {task.description || 'No description provided.'}
                </p>

                {/* FILE PREVIEWS */}
                {task.files?.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {task.files.map((f, idx) => {
                      const isImage = /\.(png|jpe?g|gif|webp)$/i.test(f.originalName);
                      const isPdf = /\.pdf$/i.test(f.originalName);
                      return (
                        <div
                          key={idx}
                          className="group relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:shadow-sm transition-all"
                        >
                          {isImage ? (
                            <img
                              src={f.fileUrl}
                              alt={f.originalName}
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-32 text-gray-600">
                              <FileText size={28} className="text-[#7866FA]" />
                              <p className="text-xs mt-1">
                                {isPdf ? 'PDF File' : 'Attachment'}
                              </p>
                            </div>
                          )}

                          <a
                            href={f.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 opacity-0 group-hover:opacity-100 text-white text-xs font-medium transition-all"
                          >
                            <ExternalLink size={14} className="mr-1" /> View
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* SUBMISSION LINK */}
                {task.submissionLink && (
                  <div className="bg-gray-50 border rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-gray-800 mb-1">Submission Link:</p>
                    <a
                      href={task.submissionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7866FA] hover:underline break-words text-sm"
                    >
                      {task.submissionLink}
                    </a>
                  </div>
                )}

                {/* FEEDBACK / AWAITING STATE */}
                {latestFeedback ? (
                  <div className="bg-[#f9f9ff] border-l-4 border-[#7866FA] rounded-md p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare size={15} className="text-[#7866FA]" />
                      <h4 className="text-sm font-semibold text-gray-800">Latest Feedback</h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-snug">
                      {latestFeedback.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(latestFeedback.createdAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center text-gray-600 text-sm">
                    <Clock size={18} className="text-[#7866FA] mb-1" />
                    <p>Awaiting mentor feedback...</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
