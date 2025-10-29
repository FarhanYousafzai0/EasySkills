import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
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
      enum: [
        "1-on-1 Mentorship",
        "Group Mentorship",
      ],
    },
    batch: {
      type: String,
      default: "",
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
  },
  { timestamps: true }
);

const AddStudent =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);

export default  AddStudent;
