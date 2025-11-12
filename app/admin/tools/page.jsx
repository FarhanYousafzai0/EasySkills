"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Wrench,
  EllipsisVertical,
  X,
  Edit,
  Trash2,
  ExternalLink,
  Star,
} from "lucide-react";
import { toast } from "sonner";

export default function AllToolsPage() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [editTool, setEditTool] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const fetchTools = async (category = "") => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/tools${category && category !== "All" ? `?category=${category}` : ""}`
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

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;
    try {
      const res = await fetch(`/api/admin/tools?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("🗑️ Tool deleted successfully");
        fetchTools(selectedCategory);
      } else toast.error(data.message);
    } catch {
      toast.error("Error deleting tool");
    }
  };

  const handleSaveEdit = async (tool) => {
    try {
      const res = await fetch("/api/admin/tools", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tool._id, ...tool }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ Tool updated successfully");
        setEditTool(null);
        fetchTools(selectedCategory);
      } else toast.error(data.message || "Tool not found");
    } catch {
      toast.error("Error updating tool");
    }
  };

  const toggleDescription = (toolId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [toolId]: !prev[toolId]
    }));
  };

  const truncateDescription = (text, limit = 80) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
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
              All Tools
            </h1>
            <p className="text-gray-500 mt-1">Manage your AI tools collection</p>
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
              className={`px-5 py-2.5 cursor-pointer rounded-full text-sm font-medium transition-all duration-200 shadow-sm border ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-[#9380FD] to-[#7866FA] text-white shadow-lg border-transparent"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="text-[#7866FA]" size={36} />
            </motion.div>
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto border border-gray-200 shadow-sm">
              <Wrench className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No tools found</h3>
              <p className="text-gray-500">No tools available in this category.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {tools.map((tool) => (
              <motion.div
                key={tool._id}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white/95 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Image Container with Padding */}
                {tool.imageUrl && (
                  <div className="p-4 pb-0">
                    <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-video">
                      <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-lg truncate">
                        {tool.name}
                      </h3>
                      
                      {/* Description with Read More */}
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {expandedDescriptions[tool._id] 
                            ? tool.description 
                            : truncateDescription(tool.description)
                          }
                        </p>
                        {tool.description.length > 80 && (
                          <button
                            onClick={() => toggleDescription(tool._id)}
                            className="text-[#7866FA] text-xs font-medium mt-1 cursor-pointer hover:text-[#9380FD] transition-colors"
                          >
                            {expandedDescriptions[tool._id] ? 'Read less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 3-dot menu */}
                    <div className="relative ml-2">
                      <button
                        onClick={() =>
                          setMenuOpen(menuOpen === tool._id ? null : tool._id)
                        }
                        className="p-2 hover:bg-gray-100 cursor-pointer rounded-xl transition-colors duration-200"
                      >
                        <EllipsisVertical size={18} className="text-gray-500" />
                      </button>

                      <AnimatePresence>
                        {menuOpen === tool._id && (
                          <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.95 }}
                            className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-40 overflow-hidden backdrop-blur-sm"
                          >
                            <button
                              onClick={() => {
                                setEditTool(tool);
                                setMenuOpen(null);
                              }}
                              className="flex items-center cursor-pointer gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-[#9380FD]/10 transition-colors"
                            >
                              <Edit size={16} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(tool._id);
                                setMenuOpen(null);
                              }}
                              className="flex items-center cursor-pointer gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Price and Category */}
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
                          <ExternalLink size={14} className="text-gray-500" />
                        </a>
                      )}
                    </div>
                    <span className="text-xs bg-gradient-to-r from-[#9380FD]/10 to-[#7866FA]/10 text-[#7866FA] px-3 py-1.5 rounded-full font-medium">
                      {tool.category}
                    </span>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#9380FD]/20 rounded-2xl transition-all duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {editTool && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200"
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">
                    Edit Tool
                  </h3>
                  <button
                    onClick={() => setEditTool(null)}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveEdit(editTool);
                  }}
                  className="p-6 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tool Name
                    </label>
                    <input
                      value={editTool.name}
                      onChange={(e) =>
                        setEditTool({ ...editTool, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7866FA] focus:border-transparent transition-all"
                      placeholder="Enter tool name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editTool.description}
                      onChange={(e) =>
                        setEditTool({ ...editTool, description: e.target.value })
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7866FA] focus:border-transparent transition-all"
                      placeholder="Enter tool description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price
                      </label>
                      <input
                        type="number"
                        value={editTool.price}
                        onChange={(e) =>
                          setEditTool({ ...editTool, price: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7866FA] focus:border-transparent transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <input
                        value={editTool.category}
                        onChange={(e) =>
                          setEditTool({ ...editTool, category: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7866FA] focus:border-transparent transition-all"
                        placeholder="Category"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tool Link
                    </label>
                    <input
                      value={editTool.link}
                      onChange={(e) =>
                        setEditTool({ ...editTool, link: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#7866FA] focus:border-transparent transition-all"
                      placeholder="https://example.com"
                    />
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#9380FD] cursor-pointer to-[#7866FA] text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mt-2"
                  >
                    Save Changes
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}