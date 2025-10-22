import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  tags: [String],
  batches: [String],
  status: { type: String, default: "active" },
  createdBy: { type: String, default: "system", required: false }, // 👈 now optional
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
