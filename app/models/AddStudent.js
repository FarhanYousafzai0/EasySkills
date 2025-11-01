import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    plan: {
      type: String,
      required: [true, "Plan is required"],
      enum: ["1-on-1 Mentorship", "Group Mentorship"],
    },
    batch: {
      type: String,
      default: "Unassigned",
    },
    joinDate: {
      type: Date,
      required: [true, "Join Date is required"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    // analytics & tracking
    progress: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    issuesReported: { type: Number, default: 0 },
    mentorships: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Student =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);

export default Student;
