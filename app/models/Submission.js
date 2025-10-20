
import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  title: { type: String, required: true },
  description: String,
  fileUrl: String, // Cloudinary URL (Phase 2C)
  status: { type: String, enum: ["submitted", "approved", "changesRequested"], default: "submitted" },
  feedback: String,
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
