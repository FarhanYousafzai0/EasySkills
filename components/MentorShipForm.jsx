"use client"

import React, { useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { Send, Upload } from "lucide-react";

export default function EnrollNow() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    payment: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "payment") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.whatsapp) newErrors.whatsapp = "WhatsApp number is required";
    if (!formData.payment) newErrors.payment = "Please attach your payment screenshot";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    emailjs
      .send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        {
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
        },
        "YOUR_PUBLIC_KEY"
      )
      .then(
        () => {
          setIsSubmitting(false);
          setSuccess(true);
          setFormData({ name: "", email: "", whatsapp: "", payment: null });
        },
        (error) => {
          console.error("FAILED...", error);
          setIsSubmitting(false);
        }
      );
  };

  return (
    <section className="w-[95%] mx-auto rounded-2xl mt-20 bg-gradient-to-br from-[#9380FD] via-[#7866FA] to-[#ECCFFE] text-white py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        
        {/* LEFT FORM */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Enroll Now</h2>
          <p className="text-white/90 mb-8">
            Complete your enrollment below to secure your mentorship seat.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-5 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none ${
                  errors.name ? "border border-red-500" : "border border-transparent"
                }`}
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-5 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none ${
                  errors.email ? "border border-red-500" : "border border-transparent"
                }`}
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <input
                type="text"
                name="whatsapp"
                placeholder="WhatsApp Number"
                value={formData.whatsapp}
                onChange={handleChange}
                className={`w-full px-5 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none ${
                  errors.whatsapp ? "border border-red-500" : "border border-transparent"
                }`}
              />
              {errors.whatsapp && <p className="text-red-400 text-sm mt-1">{errors.whatsapp}</p>}
            </div>

            <div>
              <label
                htmlFor="payment"
                className="flex items-center justify-between w-full px-5 py-3 rounded-lg bg-white text-gray-700 cursor-pointer hover:bg-gray-50 transition"
              >
                {formData.payment ? (
                  <span>{formData.payment.name}</span>
                ) : (
                  <span>Attach Payment Screenshot</span>
                )}
                <Upload className="w-5 h-5 text-gray-500" />
              </label>
              <input
                id="payment"
                type="file"
                name="payment"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
              />
              {errors.payment && <p className="text-red-400 text-sm mt-1">{errors.payment}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              disabled={isSubmitting}
              type="submit"
              className="w-full py-3 bg-black text-white rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-gray-900 transition shadow-md disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : <>Submit <Send size={18} /></>}
            </motion.button>

            {success && (
              <p className="text-green-400 text-sm mt-4">
                ✅ Enrollment submitted successfully! We’ll contact you soon.
              </p>
            )}
          </form>
        </motion.div>

        {/* RIGHT PAYMENT DETAILS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white shadow-lg"
        >
          <h3 className="text-2xl font-bold mb-4">Payment Details</h3>
          <p className="text-white/90 mb-6">
            Once you’ve made the payment, upload your screenshot using the form.  
            We’ll verify your payment and confirm your seat within 12 hours.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-white/20 rounded-lg">
              <p className="text-white/90 text-sm">Bank Name</p>
              <p className="font-semibold">Habib Bank Limited</p>
            </div>

            <div className="p-4 bg-white/20 rounded-lg">
              <p className="text-white/90 text-sm">Account Title</p>
              <p className="font-semibold">iSkills Pvt Ltd</p>
            </div>

            <div className="p-4 bg-white/20 rounded-lg">
              <p className="text-white/90 text-sm">Account Number</p>
              <p className="font-semibold">1234-5678-9012</p>
            </div>

            <div className="p-4 bg-white/20 rounded-lg">
              <p className="text-white/90 text-sm">UPI / Easypaisa / JazzCash</p>
              <p className="font-semibold">+92 300 1234567</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
