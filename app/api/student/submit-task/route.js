import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/app/models/AddStudent";
import Task from "@/app/models/Task";
import TaskSubmission from "@/app/models/TaskSubmission";

// ──────────────────────────────
// 📨 POST — Student Submits a Task
// ──────────────────────────────
export async function POST(req) {
  try {
    await connectDB();

    const { clerkId, taskId, description, link, files } = await req.json();

    if (!clerkId || !taskId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: clerkId or taskId" },
        { status: 400 }
      );
    }

    // 🧠 Find student
    const student = await Student.findOne({ clerkId });
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 🧠 Validate task
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    // 🧩 Normalize uploaded file data
    const fileData = Array.isArray(files)
      ? files.map((f) => ({
          fileUrl: f.fileUrl || f.url || "",
          filePublicId: f.filePublicId || f.public_id || "",
          originalName: f.originalName || f.original_filename || f.name || "unnamed",
        }))
      : [];

    // 🧱 Create new submission
    const newSubmission = await TaskSubmission.create({
      studentId: student._id,
      taskId: task._id,
      taskTitle: task.title,
      description: description?.trim() || "",
      submissionLink: link?.trim() || "",
      files: fileData,
      status: "submitted",
    });

    // 🔄 Optional — Update student stats
    if (typeof student.tasksCompleted === "number") {
      student.tasksCompleted += 1;
      student.totalTasks = Math.max(student.totalTasks || 0, student.tasksCompleted);
      await student.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "✅ Task submitted successfully.",
        data: newSubmission,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error submitting task:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error while submitting task" },
      { status: 500 }
    );
  }
}

// ──────────────────────────────
// 📄 GET — Fetch All Submitted Tasks for a Student
// ──────────────────────────────
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: "Missing clerkId in query parameters" },
        { status: 400 }
      );
    }

    // 🧠 Find student
    const student = await Student.findOne({ clerkId });
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 🧩 Fetch student submissions
    const submissions = await TaskSubmission.find({ studentId: student._id })
      .populate("taskId", "title dueDate priority")
      .sort({ createdAt: -1 });

    // 🧾 Format response for frontend
    const formatted = submissions.map((s) => ({
      _id: s._id,
      taskTitle: s.taskTitle || s.taskId?.title || "Untitled Task",
      description: s.description || "",
      submittedAt: s.submittedAt,
      status: s.status,
      score: s.score || 0,
      submissionLink: s.submissionLink || "",
      files: s.files || [],
      feedback: s.feedback || [], 
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.error("❌ Error fetching submitted tasks:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error while fetching tasks" },
      { status: 500 }
    );
  }
}
