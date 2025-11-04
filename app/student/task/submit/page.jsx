'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UploadCloud, Link as LinkIcon, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function SubmitTaskPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');

  const [task, setTask] = useState(null);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
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

  // ✅ Upload single file to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'student_tasks');

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
    if (files.length === 0 && !link.trim()) return toast.error('Upload files or provide a link.');
    if (!user?.id) return toast.error('User not ready. Please try again in a moment.');

    setLoading(true);
    try {
      const uploadedFiles = [];

      // Upload each file to Cloudinary
      for (let file of files) {
        const uploadRes = await uploadToCloudinary(file);
        uploadedFiles.push({
          fileUrl: uploadRes.secure_url,
          filePublicId: uploadRes.public_id,
          originalName: file.name,
        });
      }

      const res = await fetch('/api/student/submit-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          taskId,
          description,
          link: link.trim(),
          files: uploadedFiles,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('✅ Task submitted successfully!');
      setDescription('');
      setFiles([]);
      setLink('');
    } catch (err) {
      toast.error(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const removeFile = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  const safeDue =
    (task?.due && new Date(task.due)) ||
    (task?.dueDate && new Date(task.dueDate)) ||
    null;
  const safePriority = task?.priority ?? '—';
  const safeDescription = task?.description ?? 'No description provided.';

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

        {task && (
          <div className="bg-gray-50 p-4 rounded-xl border mb-6">
            <p className="text-sm text-gray-700">{safeDescription}</p>
            <p className="text-xs text-gray-500 mt-1">
              Due Date: {safeDue ? safeDue.toLocaleDateString() : '—'} | Priority: {safePriority}
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
            <label className="block text-gray-700 font-medium mb-2">Upload Files</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#9380FD] hover:bg-[#9380FD]/5 transition-all cursor-pointer">
              <UploadCloud size={28} className="text-[#7866FA] mb-2" />
              <input
                type="file"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileSelect}
              />
              <p className="text-sm text-gray-600">
                {files.length > 0 ? (
                  <span className="text-[#7866FA] font-medium">{files.length} file(s) selected</span>
                ) : (
                  <>Click to upload or drag & drop your files</>
                )}
              </p>
            </div>

            {files.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                {files.map((file, index) => (
                  <li key={index} className="flex justify-between items-center border rounded-md px-3 py-2">
                    <span className="truncate max-w-xs">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
