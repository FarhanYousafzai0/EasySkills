'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Award, Loader2, FileText, ExternalLink, Download } from 'lucide-react';
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
      const res = await fetch(`/api/student/submitted?clerkId=${user.id}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) setSubmissions(data.data);
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
      <p className="text-gray-600 mb-8">Review your submissions, grades, and feedback.</p>

      {submissions.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <FileText className="mx-auto mb-3 text-gray-400" size={40} />
          No submitted tasks yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((task, i) => (
            <motion.div
              key={task._id || i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2
                      size={18}
                      className={task.status === 'graded' ? 'text-green-500' : 'text-[#7866FA]'}
                    />
                    {task.taskTitle}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(task.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                  {task.description || 'No description provided.'}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {task.files && task.files.length > 0 && (
                    <div className="bg-gray-50 border rounded-lg p-3 w-full">
                      <p className="text-sm font-medium text-gray-800 mb-2">Uploaded Files:</p>
                      <ul className="space-y-2">
                        {task.files.map((f, idx) => (
                          <li key={idx} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 truncate max-w-[200px]">
                              <FileText size={16} className="text-[#7866FA]" />
                              {f.originalName}
                            </span>
                            <div className="flex gap-2">
                              <a
                                href={f.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#7866FA] hover:underline flex items-center gap-1"
                              >
                                <ExternalLink size={14} /> View
                              </a>
                              <a
                                href={f.fileUrl}
                                download
                                className="text-gray-500 hover:text-[#7866FA] flex items-center gap-1"
                              >
                                <Download size={14} /> Download
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {task.submissionLink && (
                    <div className="bg-gray-50 border rounded-lg p-3 w-full">
                      <p className="text-sm font-medium text-gray-800 mb-2">Submission Link:</p>
                      <a
                        href={task.submissionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7866FA] hover:underline break-words"
                      >
                        {task.submissionLink}
                      </a>
                    </div>
                  )}
                </div>

                <p
                  className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${
                    task.status === 'graded'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-[#9380FD]/10 text-[#7866FA]'
                  }`}
                >
                  {task.status === 'graded' ? 'Graded' : 'Submitted'}
                </p>
              </div>

              <div className="mt-4 border-t pt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-yellow-500" />
                  <span className="font-semibold text-gray-800 text-sm">
                    Score: {task.score ?? '-'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
