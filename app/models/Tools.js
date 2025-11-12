import mongoose from "mongoose";

const ToolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "YouTube Automation",
        "Script Writing",
        "Video Editing",
        "Thumbnail Design",
        "SEO Optimization",
        "Other",
      ],
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Tool || mongoose.model("Tool", ToolSchema);
