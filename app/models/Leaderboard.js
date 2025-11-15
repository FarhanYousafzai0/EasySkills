import mongoose from "mongoose";

const LeaderboardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // Clerk ID

    name: { type: String, required: true },

    batch: { type: String, required: true },

    profileImage: { type: String, default: "" },

    points: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },

    lastUpdated: { type: Date, default: Date.now },

    // 🔥 IMPORTANT → prevents expired students from showing
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for speed
LeaderboardSchema.index({ points: -1 });
LeaderboardSchema.index({ batch: 1 });
LeaderboardSchema.index({ userId: 1 });

export default mongoose.models.Leaderboard ||
  mongoose.model("Leaderboard", LeaderboardSchema);
