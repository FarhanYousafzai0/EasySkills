import mongoose from "mongoose";

const LiveSessionSchema = new mongoose.Schema({
  kind: { type: String, default: "live" },
  topic: { type: String, required: true },
  batch: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  recurringWeekly: { type: Boolean, default: false },
  meetingLink: String,
  notes: String,
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  createdBy: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.LiveSession || mongoose.model("LiveSession", LiveSessionSchema);
