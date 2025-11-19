'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function NewIssuePage() {
  const { user } = useUser();
  const [form, setForm] = useState({
    title: '',
    description: '',
    files: [],
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) return toast.error('User not authenticated.');
    if (!form.title.trim() || !form.description.trim())
      return toast.error('Please complete all required fields.');

    try {
      setUploading(true);

      const uploadedImages = await Promise.all(
        form.files.map(async (file) => {
          const data = new FormData();
          data.append('file', file);
          data.append(
            'upload_preset',
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          );

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: data }
          );

          if (!uploadRes.ok) {
            console.error('Cloudinary upload failed:', await uploadRes.text());
            throw new Error('Cloudinary upload failed');
          }

          const uploaded = await uploadRes.json();
          return {
            fileUrl: uploaded.secure_url,
            filePublicId: uploaded.public_id,
            originalName: uploaded.original_filename,
          };
        })
      );

      const res = await fetch('/api/student/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          title: form.title,
          description: form.description,
          images: uploadedImages,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Your issue has been submitted successfully.');
        setForm({ title: '', description: '', files: [] });
      } else {
        toast.error(result.message || 'Failed to submit your issue.');
      }
    } catch (err) {
      console.error('Error submitting issue:', err);
      toast.error('A server error occurred while submitting your issue.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Report an Issue
      </h1>

      <p className="text-gray-600 mb-6 text-center">
        Clearly describe the issue you’re experiencing. Our team will review your report and get back to you as soon as possible.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md max-w-xl mx-auto space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Report an issue</label>
          <input
            type="text"
            name="title"
            placeholder="Enter a brief title for the issue"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#9380FD]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Tell us about the issue
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Provide a clear and detailed description of the issue..."
            value={form.description}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#9380FD]"
          />
        </div>

        {/* Screenshots */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload Screenshot(s) (optional)
          </label>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-[#9380FD] transition">
            <UploadCloud size={28} className="text-[#7866FA] mb-2" />

            <input
              type="file"
              id="fileUpload"
              className="hidden"
              multiple
              onChange={handleFileChange}
            />

            <label
              htmlFor="fileUpload"
              className="text-sm text-gray-600 cursor-pointer"
            >
              {form.files.length > 0
                ? `${form.files.length} file(s) selected`
                : 'Click to upload or drag & drop'}
            </label>
          </div>

          {form.files.length > 0 && (
            <ul className="mt-2 text-xs text-gray-500 list-disc pl-4">
              {form.files.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-2.5 cursor-pointer rounded-lg text-white font-semibold transition ${
            uploading
              ? 'bg-gray-400'
              : 'bg-gradient-to-r from-[#9380FD] to-[#7866FA] hover:opacity-90'
          }`}
        >
          {uploading ? 'Submitting...' : 'Submit Issue'}
        </button>
      </motion.form>
    </div>
  );
}
