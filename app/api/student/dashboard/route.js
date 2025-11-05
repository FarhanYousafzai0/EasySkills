import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/app/models/Task";
import TaskSubmission from "@/app/models/TaskSubmission";
import LiveSession from "@/app/models/LiveSession";
import Student from "@/app/models/AddStudent";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: "Missing clerkId" },
        { status: 400 }
      );
    }

    // 🧠 1️⃣ Find student
    const student = await Student.findOne({ clerkId });
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const batch = student.batch;

    // 🧩 2️⃣ Tasks summary
    const totalTasks = await Task.countDocuments({ batches: { $in: [batch] } });
    const submissions = await TaskSubmission.find({ studentId: student._id });
    const completedTasks = submissions.filter((s) => s.status === "graded").length;
    const pendingTasks = Math.max(0, totalTasks - completedTasks);

    // 🎯 3️⃣ Mentorship details
    const mentorshipDaysLeft = student.mentorshipDaysLeft || 0;
    const mentorshipEnd = student.mentorshipEnd || null;

    // 📅 4️⃣ Fetch next upcoming session (same logic as /student/livesessions)
    const sessions = await LiveSession.find({ batch })
      .sort({ date: 1 })
      .select("topic batch date time meetingLink status");

    const now = new Date();
    const upcomingSession = sessions.find((s) => new Date(s.date) >= now) || null;

    return NextResponse.json({
      success: true,
      data: {
        studentName: student.name,
        batch,
        totalTasks,
        completedTasks,
        pendingTasks,
        mentorshipDaysLeft,
        mentorshipEnd,
        upcomingSession,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching student dashboard data:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
