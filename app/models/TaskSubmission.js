import mongoose from "mongoose";

const TaskSubmissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    taskTitle: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileUrl: { type: String },
    filePublicId: { type: String },
    submissionLink: { type: String, trim: true }, 
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Submitted", "Reviewed"],
      default: "Submitted",
    },
  },
  { timestamps: true }
);

export default mongoose.models.TaskSubmission ||
  mongoose.model("TaskSubmission", TaskSubmissionSchema);
