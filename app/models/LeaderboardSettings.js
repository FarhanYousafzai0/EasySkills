import mongoose from "mongoose";

const LeaderboardSettingsSchema = new mongoose.Schema(
  {
    manualScoring: { type: Boolean, default: true },
    bonusApproval: { type: Number, default: 0 },
    weeklyReset: { type: Boolean, default: false },
    monthlyReset: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.LeaderboardSettings ||
  mongoose.model("LeaderboardSettings", LeaderboardSettingsSchema);
