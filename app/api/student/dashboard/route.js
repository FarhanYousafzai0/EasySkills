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
      return NextResponse.json({ success: false, message: "Missing clerkId" }, { status: 400 });
    }

    // 1️⃣ Find student
    const student = await Student.findOne({ clerkId });
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    const batch = student.batch;

    // 2️⃣ Task summary
    const totalTasks = await Task.countDocuments({ batches: { $in: [batch] } });
    const submissions = await TaskSubmission.find({ studentId: student._id });
    const completedTasks = submissions.filter((s) => s.status === "graded").length;
    const pendingTasks = Math.max(0, totalTasks - completedTasks);

    // 3️⃣ Mentorship details
    const mentorshipEndDate = student.mentorshipEnd || null;
    let mentorshipDaysLeft = 0;
    if (mentorshipEndDate) {
      const end = new Date(mentorshipEndDate);
      const now = new Date();
      mentorshipDaysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    }

    // 4️⃣ Upcoming session
    const now = new Date();
    const sessions = await LiveSession.find({
      batch,
      status: { $in: ["scheduled", "active"] },
    })
      .sort({ date: 1, time: 1 })
      .select("topic batch date time meetingLink status");

    const upcomingSession = sessions.find((s) => new Date(s.date) >= now) || null;

    // 5️⃣ Dynamic Weekly Task Activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const last7 = submissions.filter((s) => new Date(s.createdAt) >= sevenDaysAgo);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyCount = Array(7).fill(0);

    last7.forEach((s) => {
      const day = new Date(s.createdAt).getDay();
      dailyCount[day] += 1;
    });

    const weeklyActivity = {
      labels: weekdays,
      data: dailyCount,
    };

    // 6️⃣ Dynamic Grade Trend (Last 4 Weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const gradedSubs = submissions.filter(
      (s) => s.status === "graded" && new Date(s.updatedAt || s.createdAt) >= fourWeeksAgo
    );

    const weekMap = {};
    gradedSubs.forEach((s) => {
      const d = new Date(s.updatedAt || s.createdAt);
      const weekNum = Math.floor((d - fourWeeksAgo) / (7 * 24 * 60 * 60 * 1000));
      if (!weekMap[weekNum]) weekMap[weekNum] = [];
      if (s.grade !== undefined && s.grade !== null) weekMap[weekNum].push(s.grade);
    });

    const gradeLabels = [];
    const gradeData = [];
    Object.keys(weekMap)
      .sort((a, b) => a - b)
      .forEach((w) => {
        const vals = weekMap[w];
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        gradeLabels.push(`Week ${parseInt(w) + 1}`);
        gradeData.push(Math.round(avg));
      });

    const gradeTrend = {
      labels: gradeLabels,
      data: gradeData,
    };

    // 7️⃣ Return combined data
    return NextResponse.json({
      success: true,
      data: {
        studentName: student.name,
        batch,
        totalTasks,
        completedTasks,
        pendingTasks,
        mentorshipDaysLeft,
        mentorshipEndDate,
        upcomingSession,
        charts: { weeklyActivity, gradeTrend },
      },
    });
  } catch (err) {
    console.error("❌ Error fetching student dashboard data:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
