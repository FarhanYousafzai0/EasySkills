import mongoose from "mongoose";

const BatchSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, default: "active" },
    createdBy: { type: String ,default:"system" ,required:"false"},
  },
  { timestamps: true }
);


export default mongoose.models.Batch || mongoose.model("Batch", BatchSchema);
