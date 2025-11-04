import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/app/models/Task";
import TaskSubmission from "@/app/models/TaskSubmission";
import Student from "@/app/models/AddStudent";

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

    // ✅ Find the student (if logged in)
    let student = null;
    if (clerkId) {
      student = await Student.findOne({ clerkId });
    }

    // ✅ Get all tasks for the student's batch
    const tasks = await Task.find({ batches: { $in: [batch] } })
      .sort({ dueDate: 1 })
      .select("title description dueDate priority status");

    // ✅ Get all submissions by this student
    let submissions = [];
    if (student) {
      submissions = await TaskSubmission.find({ studentId: student._id });
    }

    // ✅ Merge tasks + submissions
    const mergedTasks = tasks.map((task) => {
      const submission = submissions.find(
        (s) => s.taskId.toString() === task._id.toString()
      );

      // Determine accurate visual status
      let displayStatus = "pending";
      let score = null;

      if (submission) {
        if (submission.status === "graded") {
          displayStatus = "graded";
          score = submission.score || 0;
        } else if (submission.status === "submitted") {
          displayStatus = "submitted";
        } else if (submission.status === "reviewed") {
          displayStatus = "reviewed";
        }
      }

      return {
        _id: task._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: displayStatus,
        score, // 👈 will be null if not graded yet
      };
    });

    return NextResponse.json({ success: true, data: mergedTasks });
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
