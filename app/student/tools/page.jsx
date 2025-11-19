"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Wrench, ExternalLink, MessageCircleHeart } from "lucide-react";
import { toast } from "sonner";

export default function StudentToolsPage() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const fetchTools = async (category = "") => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/tools${
          category && category !== "All" ? `?category=${category}` : ""
        }`
      );
      const data = await res.json();
      if (data.success) {
        setTools(data.data);
        const cats = [...new Set(data.data.map((t) => t.category))];
        setCategories(["All", ...cats]);
      } else toast.error(data.message);
    } catch {
      toast.error("Error fetching tools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const truncate = (text, len = 100) =>
    text.length <= len ? text : `${text.substring(0, len)}...`;

  const adminWhatsApp = "923001234567";

  const handleWhatsAppClick = (tool) => {
    const message = encodeURIComponent(
      `Hello! I'm interested in the tool "${tool.name}" (Price: $${tool.price}). Could you please share more details?`
    );
    const url = `https://wa.me/${adminWhatsApp}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-gradient-to-r from-[#9380FD] to-[#7866FA] rounded-xl shadow-lg">
            <Wrench className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Explore Tools
            </h1>
            <p className="text-gray-500 mt-1">
              Browse premium YouTube Automation tools and resources curated to help you scale faster.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setSelectedCategory(cat);
                fetchTools(cat);
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white border-transparent shadow-lg"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-[#7866FA]" size={36} />
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto border border-gray-200 shadow-sm">
              <Wrench className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No tools available
              </h3>
              <p className="text-gray-500">
                Check back soon — new tools are added regularly!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {tools.map((tool) => (
              <motion.div
                key={tool._id}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative flex flex-col bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                {tool.imageUrl && (
                  <div className="p-4 pb-0">
                    <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-video">
                      <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col flex-grow p-5">
                  <h3 className="font-bold text-gray-800 text-lg truncate">
                    {tool.name}
                  </h3>

                  <div className="mt-2 text-sm text-gray-600 leading-relaxed flex-grow">
                    {/* Improved Description */}
                    {expandedDescriptions[tool._id]
                      ? tool.description
                      : truncate(tool.description)}
                    {tool.description.length > 100 && (
                      <button
                        onClick={() => toggleDescription(tool._id)}
                        className="ml-1 text-[#7866FA] text-xs font-medium hover:text-[#9380FD]"
                      >
                        {expandedDescriptions[tool._id]
                          ? "Read less"
                          : "Read more"}
                      </button>
                    )}
                  </div>

                  {/* Price + Link */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#7866FA]">
                        ${tool.price}
                      </span>
                      {tool.link && (
                        <a
                          href={tool.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ExternalLink size={15} className="text-gray-500" />
                        </a>
                      )}
                    </div>
                    <span className="text-xs bg-gradient-to-r from-[#9380FD]/10 to-[#7866FA]/10 text-[#7866FA] px-3 py-1.5 rounded-full font-medium">
                      {tool.category}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Contact Button */}
                <div className="p-5 pt-0 mt-auto">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleWhatsAppClick(tool)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold shadow hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <MessageCircleHeart size={17} /> Contact on WhatsApp
                    </div>
                  </motion.button>
                </div>

                <div className="absolute inset-0 border-2 border-transparent hover:border-[#9380FD]/20 rounded-2xl transition-all duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
