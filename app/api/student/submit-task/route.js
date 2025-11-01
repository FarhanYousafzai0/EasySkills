import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Student from "@/app/models/AddStudent";
import Task from "@/app/models/Task";
import TaskSubmission from "@/app/models/TaskSubmission";

export async function POST(req) {
  try {
    await connectDB();
    const { clerkId, taskId, description, fileUrl, filePublicId } = await req.json();

    if (!clerkId || !taskId) {
      return NextResponse.json(
        { success: false, message: "Missing clerkId or taskId" },
        { status: 400 }
      );
    }

    // 🧠 Find the student by Clerk ID
    const student = await Student.findOne({ clerkId });
    if (!student)
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );

    // 🧩 Validate task
    const task = await Task.findById(taskId);
    if (!task)
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );

    // 🧱 Create task submission
    const submission = await TaskSubmission.create({
      studentId: student._id,
      taskId: task._id,
      title: task.title, // ✅ Include task title for clarity
      description,
      fileUrl,
      filePublicId,
      status: "Submitted",
    });

    // 🌀 Update student progress stats
    student.tasksCompleted += 1;
    student.totalTasks = Math.max(student.totalTasks, student.tasksCompleted);
    await student.save();

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
