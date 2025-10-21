import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    batch: { type: String, required: true },
    role: { type: String, default: "student" }, // ✅ Add role field

    ipAddress: { type: String }, // ✅ added this line

    mentorships: [
      {
        type: { type: String, required: true },
        active: { type: Boolean, default: true },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],

    progress: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    issuesReported: { type: Number, default: 0 },
    lastIssueDate: { type: Date },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", studentSchema);
