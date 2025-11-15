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
      default: false,
    },

    // ✅ FIXED: More explicit array definition
    enrolledCourses: [{
      type: String,
      trim: true
    }],

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

    mentorships: [{
      plan: String,
      start: Date,
      end: Date,
      daysLeft: Number,
    }],

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

    // ✅ ADDED: Missing field from your API
    inviteLink: {
      type: String,
      default: "",
    },
  },
  { 
    timestamps: true,
    strict: true // ✅ Enforce schema strictly
  }
);

// ✅ Add indexes for better query performance
StudentSchema.index({ email: 1 });
StudentSchema.index({ clerkId: 1 });

export default mongoose.models.Student ||
  mongoose.model("Student", StudentSchema);