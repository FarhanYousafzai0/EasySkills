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

    // 1️⃣ FETCH STUDENT
    const student = await Student.findOne({ clerkId });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const batch = student.batch;
    const now = new Date();

    /* ======================================================
       2️⃣ MENTORSHIP + COURSE ACCESS CONTROL
    ======================================================= */
    let isMentorshipActive = true;
    let lockReason = null;

    let mentorshipDaysLeft = 0;
    if (student.mentorshipEnd) {
      const end = new Date(student.mentorshipEnd);
      mentorshipDaysLeft = Math.max(
        0,
        Math.ceil((end - now) / (1000 * 60 * 60 * 24))
      );

      if (mentorshipDaysLeft <= 0) {
        isMentorshipActive = false;
        lockReason = "MENTORSHIP_EXPIRED";
      }
    }

    // if student has 0 courses → no course lock, just hide pages on UI
    const hasCourses = Array.isArray(student.courses) ? student.courses.length > 0 : false;

    const allowAccess = isMentorshipActive;

    // If locked → return ONLY lock info (faster)
    if (!allowAccess) {
      return NextResponse.json({
        success: true,
        access: {
          allowAccess: false,
          lockReason,
          mentorshipDaysLeft,
          isEnrolled: student.isEnrolled,
          hasCourses,
        },
        data: null,
      });
    }

    /* ======================================================
       3️⃣ TASK SUMMARY
    ======================================================= */
    const totalTasks = await Task.countDocuments({
      batches: { $in: [batch] },
    });

    const submissions = await TaskSubmission.find({ studentId: student._id });
    const completedTasks = submissions.filter((s) => s.status === "graded").length;
    const pendingTasks = Math.max(0, totalTasks - completedTasks);

    /* ======================================================
       4️⃣ UPCOMING SESSION
    ======================================================= */
    const sessions = await LiveSession.find({
      batch,
      status: { $in: ["scheduled", "active"] },
    })
      .sort({ date: 1, time: 1 })
      .select("topic batch date time meetingLink status");

    const upcomingSession =
      sessions.find((s) => new Date(s.date) >= now) || null;

    /* ======================================================
       5️⃣ WEEKLY ACTIVITY (7 Days)
    ======================================================= */
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);

    const last7 = submissions.filter(
      (s) => new Date(s.createdAt) >= sevenDaysAgo
    );

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

    /* ======================================================
       6️⃣ GRADE TREND (4 Weeks)
    ======================================================= */
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(now.getDate() - 28);

    const gradedSubs = submissions.filter(
      (s) =>
        s.status === "graded" &&
        new Date(s.updatedAt || s.createdAt) >= fourWeeksAgo
    );

    const weekMap = {};
    gradedSubs.forEach((s) => {
      const d = new Date(s.updatedAt || s.createdAt);
      const weekNum = Math.floor((d - fourWeeksAgo) / (7 * 24 * 60 * 60 * 1000));
      if (!weekMap[weekNum]) weekMap[weekNum] = [];
      if (s.grade != null) weekMap[weekNum].push(s.grade);
    });

    const gradeLabels = [];
    const gradeData = [];

    Object.keys(weekMap)
      .sort((a, b) => a - b)
      .forEach((week) => {
        const vals = weekMap[week];
        const avg =
          vals.length > 0
            ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
            : 0;

        gradeLabels.push(`Week ${parseInt(week) + 1}`);
        gradeData.push(avg);
      });

    const gradeTrend = {
      labels: gradeLabels,
      data: gradeData,
    };

    /* ======================================================
       7️⃣ FINAL RESPONSE
    ======================================================= */
    return NextResponse.json({
      success: true,
      access: {
        allowAccess: true,
        lockReason: null,
        mentorshipDaysLeft,
        hasCourses,
        isEnrolled: student.isEnrolled,
      },
      data: {
        studentName: student.name,
        batch,
        totalTasks,
        completedTasks,
        pendingTasks,
        mentorshipDaysLeft,
        mentorshipEndDate: student.mentorshipEnd,
        upcomingSession,
        charts: {
          weeklyActivity,
          gradeTrend,
        },
      },
    });
  } catch (err) {
    console.error("❌ Error in /api/student/dashboard:", err);
    return NextResponse.json(
      { success: false, message: "Server error loading dashboard" },
      { status: 500 }
    );
  }
}
