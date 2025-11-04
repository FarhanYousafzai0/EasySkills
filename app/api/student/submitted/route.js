import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TaskSubmission from "@/app/models/TaskSubmission";
import Student from "@/app/models/AddStudent";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: "Missing clerkId" },
        { status: 400 }
      );
    }

    // 🧠 Find the student
    const student = await Student.findOne({ clerkId });
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 🧩 Fetch all submissions (submitted or graded only)
    const submissions = await TaskSubmission.find({
      studentId: student._id,
      status: { $in: ["submitted", "graded"] },
    }).sort({ submittedAt: -1 });

    return NextResponse.json({ success: true, data: submissions });
  } catch (err) {
    console.error("❌ Error fetching submitted tasks:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
