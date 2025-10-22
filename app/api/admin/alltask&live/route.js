import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/app/models/Task";
import LiveSession from "@/app/models/LiveSession";

// ✅ Get all Tasks & Live Sessions (merged)
export async function GET() {
  try {
    await connectDB();

    const tasks = await Task.find().lean();
    const sessions = await LiveSession.find().lean();

    const formatted = [
      ...tasks.map((t) => ({
        id: t._id,
        kind: "task",
        title: t.title,
        due: t.dueDate,
        batch: t.batches,
        status: t.status,
      })),
      ...sessions.map((s) => ({
        id: s._id,
        kind: "live",
        topic: s.topic,
        date: s.date,
        time: s.time,
        batch: s.batch,
        recurring: s.recurringWeekly,
        status: s.status,
      })),
    ];

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Error fetching items:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
