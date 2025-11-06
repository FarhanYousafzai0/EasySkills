import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
  message: { type: String, required: true },
  fromAdmin: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const reportSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }], // Cloudinary URLs
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    feedback: [feedbackSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", reportSchema);