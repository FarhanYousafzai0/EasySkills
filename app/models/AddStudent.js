import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    // ============================
    // 🔐 AUTH & IDENTIFIERS
    // ============================
    clerkId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // ============================
    // 🎓 LEARNING PLAN
    // ============================
    plan: {
      type: String,
      required: true,
      enum: ["1-on-1 Mentorship", "Group Mentorship"],
    },

    batch: {
      type: String,
      default: "Unassigned",
    },

    joinDate: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // ============================
    // 📘 COURSE ENROLLMENT SYSTEM
    // ============================
    isEnrolled: {
      type: Boolean,
      default: false, // Admin decides
    },

    enrolledCourses: {
      type: [String], // store course IDs
      default: [],
    },

    // ============================
    // 🕒 MENTORSHIP LIFECYCLE
    // ============================
    mentorshipStart: {
      type: Date,
      default: null,
    },

    mentorshipEnd: {
      type: Date,
      default: null,
    },

    mentorshipDaysLeft: {
      type: Number,
      default: 0,
    },

    isMentorshipActive: {
      type: Boolean,
      default: true,
    },

    mentorships: {
      type: [
        {
          plan: String,
          start: Date,
          end: Date,
          daysLeft: Number,
        },
      ],
      default: [],
    },

    // ============================
    // 📊 ANALYTICS & PROGRESS
    // ============================
    progress: {
      type: Number,
      default: 0,
    },

    totalTasks: {
      type: Number,
      default: 0,
    },

    tasksCompleted: {
      type: Number,
      default: 0,
    },

    issuesReported: {
      type: Number,
      default: 0,
    },

    totalScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Student ||
  mongoose.model("Student", StudentSchema);
