import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/app/models/Task";
import LiveSession from "@/app/models/LiveSession";

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    if (data.kind === "task") {
      const newTask = await Task.create({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        tags: data.tags,
        batches: data.batches,
        status: data.status || "active",
      });

      return NextResponse.json({ success: true, type: "task", data: newTask });
    }

    if (data.kind === "live") {
      const newSession = await LiveSession.create({
        topic: data.topic,
        batch: data.batch,
        date: data.date,
        time: data.time,
        recurringWeekly: data.recurringWeekly || false,
        meetingLink: data.meetingLink,
        notes: data.notes,
        status: data.status || "scheduled",
      });

      // 🌀 If recurring weekly, auto-generate next 4 weeks
      if (data.recurringWeekly) {
        const baseDate = new Date(data.date);
        const futureSessions = [];
        for (let i = 1; i <= 4; i++) {
          const next = new Date(baseDate);
          next.setDate(next.getDate() + 7 * i);
          futureSessions.push({
            topic: data.topic,
            batch: data.batch,
            date: next.toISOString().split("T")[0],
            time: data.time,
            recurringWeekly: true,
            meetingLink: data.meetingLink,
            notes: data.notes,
            status: "scheduled",
          });
        }
        await LiveSession.insertMany(futureSessions);
      }

      return NextResponse.json({ success: true, type: "live", data: newSession });
    }

    return NextResponse.json({ success: false, message: "Invalid kind" }, { status: 400 });
  } catch (err) {
    console.error("❌ Error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
