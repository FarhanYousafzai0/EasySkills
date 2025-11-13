import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    completedVideos: { type: [String], default: [] }, // store video _id strings
    lastWatchedVideo: { type: String, default: "" },
    percentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProgressSchema.index({ clerkId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);
