import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TaskSubmission from "@/app/models/TaskSubmission";
import Student from "@/app/models/AddStudent";

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

    // ✅ Find the submission
    const submission = await TaskSubmission.findById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    // ✅ Normalize and update the status
    const normalizedStatus = status ? status.toLowerCase() : submission.status;
    if (!["pending", "submitted", "reviewed", "graded"].includes(normalizedStatus)) {
      return NextResponse.json(
        { success: false, message: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    // ✅ Apply updates
    submission.status = normalizedStatus;
    if (typeof score === "number") {
      submission.score = score;
    }

    await submission.save();

    // ✅ Update student leaderboard progress
    const student = await Student.findById(submission.studentId);
    if (student && typeof score === "number") {
      student.progress = (student.progress ?? 0) + score;
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
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
