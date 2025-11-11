import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/app/models/AddStudent";
import TaskSubmission from "@/app/models/TaskSubmission";

// ──────────────────────────────
// 🧩 POST — Update Submission (Admin Review / Grade)
// ──────────────────────────────
export async function POST(req) {
  try {
    await connectDB();

    const { submissionId, status, score } = await req.json();

    if (!submissionId) {
      return NextResponse.json(
        { success: false, message: "Missing submission ID" },
        { status: 400 }
      );
    }

    // ✅ Find submission
    const submission = await TaskSubmission.findById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    // ✅ Normalize and validate status
    const normalizedStatus = status ? status.toLowerCase() : submission.status;
    if (!["pending", "submitted", "reviewed", "graded"].includes(normalizedStatus)) {
      return NextResponse.json(
        { success: false, message: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    // ✅ Apply updates
    submission.status = normalizedStatus;
    if (typeof score === "number") submission.score = score;

    await submission.save();

    // ✅ Update student’s totalScore or progress for leaderboard tracking
    const student = await Student.findById(submission.studentId);
    if (student && typeof score === "number") {
      student.totalScore = (student.totalScore ?? 0) + score;
      await student.save();
    }

    return NextResponse.json({
      success: true,
      message: "Submission updated successfully",
      data: submission,
    });
  } catch (err) {
    console.error("❌ Error updating submission:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// ──────────────────────────────
// 📄 GET — Fetch All Submissions (Admin)
// ──────────────────────────────
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const batch = searchParams.get("batch");

    // 🧠 Build query
    const query = {};
    if (batch && batch !== "All") {
      const batchStudents = await Student.find({ batch }).select("_id");
      query.studentId = { $in: batchStudents.map((s) => s._id) };
    }

    // 🧩 Fetch submissions with full details
    const submissions = await TaskSubmission.find(query)
      .populate("studentId", "name email batch")
      .populate("taskId", "title dueDate priority")
      .sort({ createdAt: -1 })
      .lean();

    // 🧾 Format response for frontend
    const formatted = submissions.map((s) => ({
      id: s._id?.toString(),
      studentName: s.studentId?.name || "Unknown",
      email: s.studentId?.email || "",
      batch: s.studentId?.batch || "N/A",
      taskTitle: s.taskId?.title || "Unknown Task",
      submittedAt: s.submittedAt || s.createdAt,
      status: (s.status || "submitted").toLowerCase(),
      submissionLink: s.submissionLink || "",
      files: Array.isArray(s.files) ? s.files : [],
      score: typeof s.score === "number" ? s.score : 0,
      description: s.description || "",
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.error("❌ Error fetching submissions:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error while fetching submissions" },
      { status: 500 }
    );
  }
}
