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
    const clerkId = searchParams.get("clerkId"); // optional — for matching submission ownership

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch parameter missing" },
        { status: 400 }
      );
    }

    // 🧠 Find the student (if clerkId provided)
    let student = null;
    if (clerkId) {
      student = await Student.findOne({ clerkId });
    }

    // 🧩 Fetch all tasks assigned to this batch
    const tasks = await Task.find({ batches: { $in: [batch] } })
      .sort({ dueDate: 1 })
      .select("title description dueDate priority status");

    // 🧠 If we have the student, check submissions
    let submissions = [];
    if (student) {
      submissions = await TaskSubmission.find({ studentId: student._id });
    }

    // 🧩 Merge submission data into tasks
    const mergedTasks = tasks.map((task) => {
      const submission = submissions.find(
        (s) => s.taskId.toString() === task._id.toString()
      );

      // Determine visual status
      const displayStatus = submission
        ? submission.status === "Graded"
          ? "completed"
          : "submitted"
        : "pending";

      return {
        _id: task._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: displayStatus,
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
