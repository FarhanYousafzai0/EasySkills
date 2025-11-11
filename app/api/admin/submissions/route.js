import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TaskSubmission from "@/app/models/TaskSubmission";
import Student from "@/app/models/AddStudent";

// ──────────────────────────────
// 📄 GET — Fetch All Submissions (Admin)
// ──────────────────────────────
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const batch = searchParams.get("batch");

    const query = {};
    if (batch && batch !== "All") {
      const batchStudents = await Student.find({ batch }).select("_id");
      query.studentId = { $in: batchStudents.map((s) => s._id) };
    }

    const subs = await TaskSubmission.find(query)
      .populate("studentId", "name email batch")
      .populate("taskId", "title")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: subs });
  } catch (err) {
    console.error("❌ Admin GET error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ──────────────────────────────
// ✏️ PATCH — Add Feedback / Grade / Change Status
// ──────────────────────────────
export async function PATCH(req) {
  try {
    await connectDB();

    const { submissionId, feedbackMessage, score, status } = await req.json();

    if (!submissionId)
      return NextResponse.json(
        { success: false, message: "Missing submissionId" },
        { status: 400 }
      );

    // Build update object
    const update = {};
    if (typeof score === "number") update.score = score;
    if (status) update.status = status.toLowerCase();

    // Handle feedback append safely
    if (feedbackMessage?.trim()) {
      update.$push = {
        feedback: {
          message: feedbackMessage.trim(),
          fromAdmin: true,
          createdAt: new Date(),
        },
      };
    }

    const updated = await TaskSubmission.findByIdAndUpdate(submissionId, update, { new: true });

    if (!updated)
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "✅ Feedback and grading updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Admin PATCH error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
