import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  kind: { type: String, default: "task" },
  title: { type: String, required: true },
  description: String,
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  tags: [String],
  batches: [String],
  status: { type: String, enum: ["active", "archived"], default: "active" },
  createdBy: { type: String, required: true }, // clerkId of admin
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
