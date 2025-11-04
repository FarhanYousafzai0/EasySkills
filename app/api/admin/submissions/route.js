import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/app/models/AddStudent";
import TaskSubmission from "@/app/models/TaskSubmission";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const batch = searchParams.get("batch");

    // 🧠 Build query: if batch selected, filter by its students
    const query = {};
    if (batch && batch !== "All") {
      const batchStudents = await Student.find({ batch }).select("_id");
      query.studentId = { $in: batchStudents.map((s) => s._id) };
    }

    // 🧩 Fetch full submissions with populated details
    const submissions = await TaskSubmission.find(query)
      .populate("studentId", "name email batch")
      .populate("taskId", "title dueDate priority")
      .sort({ createdAt: -1 })
      .lean(); // ✅ ensures plain objects with full data (especially nested arrays)

    // 🧱 Format the data safely
    const formatted = submissions.map((s) => ({
      id: s._id?.toString(),
      studentName: s.studentId?.name || "Unknown",
      email: s.studentId?.email || "",
      batch: s.studentId?.batch || "N/A",
      taskTitle: s.taskId?.title || "Unknown Task",
      submittedAt: s.submittedAt || s.createdAt,
      status: (s.status || "submitted").toLowerCase(),
      submissionLink: s.submissionLink || "",
      files: Array.isArray(s.files) ? s.files : [], // ✅ ensures array safety
      score: typeof s.score === "number" ? s.score : 0,
      description: s.description || "",
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Error fetching submissions:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
