import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/app/models/Task";
import LiveSession from "@/app/models/LiveSession";

// ✅ Get all Tasks & Live Sessions (merged + smart filtering)
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const todayOnly = searchParams.get("today") === "true";
    const weekOnly = searchParams.get("week") === "true";
    const upcomingOnly = searchParams.get("upcoming") === "true";

    const tasks = await Task.find().lean();
    const sessions = await LiveSession.find().lean();

    // --- Date setup ---
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Monday–Sunday week range
    const day = today.getDay();
    const diffToMonday = (day + 6) % 7;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - diffToMonday);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // --- Merge all items ---
    let formatted = [
      ...tasks.map((t) => ({
        id: t._id.toString(),
        kind: "task",
        title: t.title,
        due: t.dueDate ? new Date(t.dueDate).toISOString() : null,
        batch: t.batches,
        status: t.status,
      })),
      ...sessions.map((s) => ({
        id: s._id.toString(),
        kind: "live",
        topic: s.topic,
        date: s.date ? new Date(s.date).toISOString() : null,
        time: s.time,
        batch: s.batch,
        recurringWeekly: s.recurringWeekly,
        meetingLink: s.meetingLink,
        status: s.status,
      })),
    ];

    // --- Filter modes ---
    if (todayOnly) {
      formatted = formatted.filter((i) => {
        if (i.kind !== "live" || !i.date) return false;
        const d = new Date(i.date);
        return d >= today && d < tomorrow;
      });
    } else if (weekOnly) {
      formatted = formatted.filter((i) => {
        if (i.kind !== "live" || !i.date) return false;
        const d = new Date(i.date);
        return d >= weekStart && d < weekEnd;
      });
    } else if (upcomingOnly) {
      formatted = formatted.filter((i) => {
        if (i.kind !== "live" || !i.date) return false;
        const d = new Date(i.date);
        return d >= now;
      });
    } else {
      // Default: exclude past sessions
      formatted = formatted.filter((i) => {
        if (i.kind === "live" && i.date) {
          const d = new Date(i.date);
          return d >= today;
        }
        return true;
      });
    }

    // --- Sort chronologically (nearest first) ---
    formatted.sort((a, b) => {
      const dateA = new Date(a.date || a.due || 0);
      const dateB = new Date(b.date || b.due || 0);
      return dateA - dateB;
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Error fetching items:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
