// app/models/Report.js
import mongoose, { Schema } from "mongoose";

// 🧩 Define feedback sub-schema
const feedbackSchema = new Schema({
  message: { type: String, required: true },
  fromAdmin: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// 🧩 Define report schema
const reportSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, required: true },
    studentBatch: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    feedback: [feedbackSchema],
  },
  { timestamps: true }
);


delete mongoose.models.Report;
export default mongoose.model("Report", reportSchema);
