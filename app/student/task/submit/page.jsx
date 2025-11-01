'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UploadCloud, Link as LinkIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function SubmitTaskPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');

  const [task, setTask] = useState(null);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Fetch task details
  useEffect(() => {
    if (!taskId) return;
    (async () => {
      try {
        const res = await fetch(`/api/student/task-detail?id=${taskId}`);
        const data = await res.json();
        if (data.success) setTask(data.task);
        else toast.error(data.message);
      } catch {
        toast.error('Failed to fetch task details.');
      }
    })();
  }, [taskId]);

  // ✅ Upload file to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: formData }
    );

    if (!res.ok) throw new Error('Failed to upload file.');
    return res.json();
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskId) return toast.error('Task ID missing.');
    if (!file && !link.trim()) return toast.error('Upload a file or provide a link.');

    setLoading(true);
    try {
      let fileUrl = '';
      let filePublicId = '';

      if (file) {
        const uploadRes = await uploadToCloudinary(file);
        fileUrl = uploadRes.secure_url;
        filePublicId = uploadRes.public_id;
      } else {
        fileUrl = link.trim();
      }

      const res = await fetch('/api/student/submit-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          taskId,
          description,
          fileUrl,
          filePublicId,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('✅ Task submitted successfully!');
      setDescription('');
      setFile(null);
      setLink('');
    } catch (err) {
      toast.error(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Task</h1>
        <p className="text-gray-600 mb-6">
          {task ? `Submitting for: ${task.title}` : 'Fetching task details...'}
        </p>

        {/* Task Info */}
        {task && (
          <div className="bg-gray-50 p-4 rounded-xl border mb-6">
            <p className="text-sm text-gray-700">{task.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              Due Date: {new Date(task.dueDate).toLocaleDateString()} | Priority: {task.priority}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short description..."
              className="w-full h-24 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9380FD]"
            />
          </div>

          {/* Link Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Submission Link (Google Drive, PDF, etc.)
            </label>
            <div className="relative">
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Paste your Google Drive or PDF link"
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9380FD]"
              />
              <LinkIcon className="absolute right-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm my-2">— or —</div>

          {/* File Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Upload File</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#9380FD] hover:bg-[#9380FD]/5 transition-all cursor-pointer">
              <UploadCloud size={28} className="text-[#7866FA] mb-2" />
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <p className="text-sm text-gray-600">
                {file ? (
                  <span className="text-[#7866FA] font-medium">{file.name}</span>
                ) : (
                  <>Click to upload or drag & drop your file</>
                )}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white font-semibold shadow-md hover:shadow-lg cursor-pointer transition-all"
          >
            {loading ? 'Submitting...' : 'Submit Task'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
