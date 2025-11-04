import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/app/models/AddStudent";
import Task from "@/app/models/Task";
import TaskSubmission from "@/app/models/TaskSubmission";

export async function POST(req) {
  try {
    await connectDB();
    const { clerkId, taskId, description, link, files } = await req.json();

    if (!clerkId || !taskId) {
      return NextResponse.json(
        { success: false, message: "Missing clerkId or taskId" },
        { status: 400 }
      );
    }

    // 🧠 Find the student
    const student = await Student.findOne({ clerkId });
    if (!student)
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );

    // 🧠 Validate task
    const task = await Task.findById(taskId);
    if (!task)
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );

    // 🧩 Prepare file data array (multiple files)
    const fileData = Array.isArray(files)
      ? files.map((f) => ({
          fileUrl: f.fileUrl,
          filePublicId: f.filePublicId,
          originalName: f.originalName,
        }))
      : [];

    // 🧱 Create task submission
    const submission = await TaskSubmission.create({
      studentId: student._id,
      taskId: task._id,
      taskTitle: task.title, // ✅ matches your schema
      description: description || "",
      submissionLink: link || "", // ✅ updated field name
      files: fileData,
      status: "Submitted",
    });

    // 🌀 Update student stats safely
    if (
      Object.prototype.hasOwnProperty.call(student.toObject(), "tasksCompleted") &&
      Object.prototype.hasOwnProperty.call(student.toObject(), "totalTasks")
    ) {
      student.tasksCompleted = (student.tasksCompleted ?? 0) + 1;
      student.totalTasks = Math.max(student.totalTasks ?? 0, student.tasksCompleted);
      await student.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Task submitted successfully",
        data: submission,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error submitting task:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
