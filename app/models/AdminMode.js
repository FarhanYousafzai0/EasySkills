// import mongoose from "mongoose";

// const adminSchema = new mongoose.Schema(
//   {
//     clerkId: { type: String, required: true, unique: true },
//     fullName: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     role: { type: String, default: "admin" },

//     ipAddress: { type: String }, // ✅ added this line

//     permissions: {
//       canAddTasks: { type: Boolean, default: true },
//       canViewReports: { type: Boolean, default: true },
//       canManageStudents: { type: Boolean, default: true },
//       canAddMentorships: { type: Boolean, default: true },
//     },

//     createdAt: { type: Date, default: Date.now },
//     lastLogin: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// export default mongoose.models.Admin || mongoose.model("Admin", adminSchema);
