import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/app/models/Task";
import TaskSubmission from "@/app/models/TaskSubmission";
import Student from "@/app/models/AddStudent";

// GET /api/student/tasks?batch=BatchA&clerkId=USER_ID
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const batch = searchParams.get("batch");
    const clerkId = searchParams.get("clerkId");

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch parameter missing" },
        { status: 400 }
      );
    }

    // Find current student (optional, but needed to map submissions)
    let student = null;
    if (clerkId) {
      student = await Student.findOne({ clerkId }).select("_id");
    }

    // All tasks in this batch
    const tasks = await Task.find({ batches: { $in: [batch] } })
      .sort({ dueDate: 1 })
      .select("_id title description dueDate priority status");

    // All submissions by this student
    let submissions = [];
    if (student) {
      submissions = await TaskSubmission.find({ studentId: student._id })
        .select("_id taskId status score submittedAt createdAt");
    }

    // Create a map of latest submission per taskId
    const latestByTaskId = new Map();
    for (const sub of submissions) {
      const key = sub.taskId.toString();
      const prev = latestByTaskId.get(key);
      const prevTime = prev ? new Date(prev.submittedAt || prev.createdAt).getTime() : 0;
      const curTime = new Date(sub.submittedAt || sub.createdAt).getTime();
      if (!prev || curTime > prevTime) latestByTaskId.set(key, sub);
    }

    // Merge tasks + latest submissions
    const mergedTasks = tasks.map((task) => {
      const sub = latestByTaskId.get(task._id.toString());
      let displayStatus = "pending";
      let score = null;

      if (sub) {
        const s = (sub.status || "").toLowerCase();
        if (s === "graded") {
          displayStatus = "graded";
          score = typeof sub.score === "number" ? sub.score : 0;
        } else if (s === "submitted") {
          displayStatus = "submitted";
        } else if (s === "reviewed") {
          displayStatus = "reviewed";
        } else if (s === "changes") {
          displayStatus = "changes";
        } else {
          // fallback if an unknown status sneaks in
          displayStatus = s || "submitted";
        }
      }

      return {
        _id: task._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: displayStatus,
        score, // null if not graded
      };
    });

    return NextResponse.json({ success: true, data: mergedTasks });
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
