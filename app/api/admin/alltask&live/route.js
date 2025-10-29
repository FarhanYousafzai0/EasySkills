import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/app/models/Task";
import LiveSession from "@/app/models/LiveSession";

// ✅ Get all Tasks & Live Sessions (merged)
export async function GET() {
  try {
    await connectDB();

    // Fetch all
    const tasks = await Task.find().lean();
    const sessions = await LiveSession.find().lean();

    // Format for unified dashboard
    const formatted = [
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
        recurring: s.recurringWeekly,
        meetingLink: s.meetingLink,
        status: s.status,
      })),
    ].sort((a, b) => {
      // sort by date (nearest first)
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
