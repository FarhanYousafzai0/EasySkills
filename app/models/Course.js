import mongoose from "mongoose";

const VideoItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true },
    duration: { type: Number, default: 0 }, // seconds
    order: { type: Number, default: 0 },
    publicId: { type: String, default: "" }, // Cloudinary public_id
  },
  { _id: true }
);

const SectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    items: { type: [VideoItemSchema], default: [] },
  },
  { _id: true }
);

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    thumbnailPublicId: { type: String, default: "" },
    category: { type: String, default: "General" },
    level: { type: String, default: "Beginner" },
 
    durationLabel: { type: String, default: "" }, // e.g. "4 months"
    accessTill: { type: Date, default: null },
    sections: { type: [SectionSchema], default: [] },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
