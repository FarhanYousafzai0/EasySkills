import mongoose from "mongoose";

const TaskSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    taskTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    files: [
      {
        fileUrl: { type: String, required: true },
        filePublicId: { type: String, required: true },
        originalName: { type: String, required: true },
      },
    ],
    submissionLink: {
      type: String,
      trim: true,
      default: "",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "reviewed", "approved"],
      default: "submitted",
    },
    score: {
      type: Number,
      default: 0,
    },
    feedback: [
      {
        message: { type: String, required: true },
        fromAdmin: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.TaskSubmission ||
  mongoose.model("TaskSubmission", TaskSubmissionSchema);
