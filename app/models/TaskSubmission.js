import mongoose from "mongoose";

const TaskSubmissionSchema = new mongoose.Schema(
  {
    // 🔹 Linked student and task references
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

    // 🔹 Core info
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

    // 🔹 File uploads (supports multiple)
    files: [
      {
        fileUrl: { type: String, required: true },
        filePublicId: { type: String, required: true },
        originalName: { type: String, required: true },
      },
    ],

    // 🔹 Optional external submission link
    submissionLink: {
      type: String,
      trim: true,
      default: "",
    },

    // 🔹 Review & grading info
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null, // not yet graded
    },
    feedback: {
      type: String,
      trim: true,
      default: "",
    },

    // 🔹 Metadata
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "Submitted", "Reviewed", "Graded"],
      default: "Submitted",
    },
  },
  { timestamps: true }
);

// ✅ Prevent model overwrite during hot reloads
export default mongoose.models.TaskSubmission ||
  mongoose.model("TaskSubmission", TaskSubmissionSchema);
