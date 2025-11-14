import mongoose from "mongoose";

const LeaderboardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },  
    batch: { type: String, required: true }, 
    points: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Leaderboard ||
  mongoose.model("Leaderboard", LeaderboardSchema);
