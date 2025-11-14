import mongoose from "mongoose";

const LeaderboardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },   // Clerk ID
    name: { type: String, required: true },                   // Student Name
    batch: { type: String, required: true },                  // Batch
    profileImage: { type: String, default: "" },              // For avatars (future use)

    points: { type: Number, default: 0 },                     // Total Score
    tasksCompleted: { type: Number, default: 0 },             // Count

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 🔥 Ensures faster sorting when leaderboard grows
LeaderboardSchema.index({ points: -1 });
LeaderboardSchema.index({ batch: 1 });
LeaderboardSchema.index({ userId: 1 });

export default mongoose.models.Leaderboard ||
  mongoose.model("Leaderboard", LeaderboardSchema);
