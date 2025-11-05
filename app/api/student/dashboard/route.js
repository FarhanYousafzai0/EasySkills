import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Task from "@/app/models/Task";
import TaskSubmission from "@/app/models/TaskSubmission";
import LiveSession from "@/app/models/LiveSession";
import Student from "@/app/models/AddStudent";

/** Combine a date (Date|string) and a "HH:mm" time string into a Date safely */
function combineDateAndTime(dateLike, timeStr) {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) return null;

  if (!timeStr) return d; // time not provided; use midnight of that date

  // timeStr may be "21:00" or "21:00 PM" etc. Try strict first, then loose.
  const m = String(timeStr).match(/(\d{1,2}):(\d{2})/);
  if (!m) return d;
  let hours = parseInt(m[1], 10);
  let minutes = parseInt(m[2], 10);
  // If AM/PM present
  const ampm = String(timeStr).toLowerCase().includes("pm")
    ? "pm"
    : String(timeStr).toLowerCase().includes("am")
    ? "am"
    : null;
  if (ampm) {
    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
  }
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/** Build last-7-days buckets (Mon..Sun based on today) from submissions */
function buildWeeklyActivity(submissions) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6); // last 7 days (inclusive)

  // Map date ISO (yyyy-mm-dd) -> count
  const counts = new Map();
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    counts.set(d.toISOString().slice(0, 10), 0);
  }

  submissions.forEach((s) => {
    const dt = new Date(s.submittedAt || s.createdAt);
    if (isNaN(dt.getTime())) return;
    if (dt >= start && dt <= now) {
      const key = dt.toISOString().slice(0, 10);
      if (counts.has(key)) counts.set(key, counts.get(key) + 1);
    }
  });

  // Labels like Mon..Sun based on the 7-day window
  const labels = [];
  const data = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    labels.push(
      d.toLocaleDateString("en-US", { weekday: "short" }) // Mon, Tue, ...
    );
    data.push(counts.get(d.toISOString().slice(0, 10)) || 0);
  }
  return { labels, data };
}

/** Build grade trend (ordered by submission time) */
function buildGradeTrend(submissions, maxPoints = 8) {
  const graded = submissions
    .filter((s) => s.status === "graded" && typeof s.score === "number")
    .sort((a, b) => new Date(a.submittedAt || a.createdAt) - new Date(b.submittedAt || b.createdAt));

  if (graded.length === 0) {
    return { labels: [], data: [] };
  }

  // take last N
  const last = graded.slice(-maxPoints);
  const labels = last.map((s, idx) => {
    const dt = new Date(s.submittedAt || s.createdAt);
    return isNaN(dt.getTime())
      ? `#${idx + 1}`
      : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  const data = last.map((s) => s.score);
  return { labels, data };
}

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

    // 1) Find student
    const student = await Student.findOne({ clerkId });
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const batch = student.batch;

    // 2) Tasks assigned to batch
    const totalTasks = await Task.countDocuments({ batches: { $in: [batch] } });

    // 3) Student submissions
    const submissions = await TaskSubmission.find({ studentId: student._id }).select(
      "status score submittedAt createdAt"
    );

    const completedTasks = submissions.filter((s) => s.status === "graded").length;
    const pendingTasks = Math.max(0, totalTasks - completedTasks);

    // 4) Mentorship details (already computed when adding student)
    const mentorshipDaysLeft = student.mentorshipDaysLeft ?? 0;
    const mentorshipEnd = student.mentorshipEnd ?? null;

    // 5) Upcoming live session (robust for string/Date + separate time field)
    const now = new Date();
    const liveSessions = await LiveSession.find({ batch }).select(
      "topic batch date time meetingLink status"
    );

    const upcoming =
      liveSessions
        .map((s) => {
          const when = combineDateAndTime(s.date, s.time);
          return when && when >= now
            ? {
                topic: s.topic,
                batch: s.batch,
                date: when.toISOString(), // ISO for client-side consistency
                time: s.time || null,
                meetingLink: s.meetingLink || "",
                status: s.status || "Scheduled",
              }
            : null;
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;

    // 6) Weekly activity + Grade trend
    const weeklyActivity = buildWeeklyActivity(submissions);
    const gradeTrend = buildGradeTrend(submissions);

    return NextResponse.json({
      success: true,
      data: {
        studentName: student.name,
        batch,
        totalTasks,
        completedTasks,
        pendingTasks,
        mentorshipDaysLeft,
        mentorshipEnd: mentorshipEnd ? new Date(mentorshipEnd).toISOString() : null,
        upcomingSession: upcoming,
        charts: {
          weeklyActivity, // { labels: [...7], data: [...] }
          gradeTrend,     // { labels: [...], data: [...] }
        },
      },
    });
  } catch (err) {
    console.error("❌ Error in /api/student/dashboard:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
