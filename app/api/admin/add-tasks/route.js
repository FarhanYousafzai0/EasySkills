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

      // ✅ If marked recurring, create only one next week's copy
      if (data.recurringWeekly) {
        const baseDate = new Date(data.date);
        const nextWeek = new Date(baseDate);
        nextWeek.setDate(baseDate.getDate() + 7);

        const nextWeekDate = nextWeek.toISOString().split("T")[0];
        const exists = await LiveSession.findOne({
          topic: data.topic,
          batch: data.batch,
          date: nextWeekDate,
        });

        if (!exists) {
          await LiveSession.create({
            topic: data.topic,
            batch: data.batch,
            date: nextWeekDate,
            time: data.time,
            recurringWeekly: true,
            meetingLink: data.meetingLink,
            notes: data.notes,
            status: "scheduled",
          });
        }
      }

      return NextResponse.json({ success: true, type: "live", data: newSession });
    }

    return NextResponse.json({ success: false, message: "Invalid kind" }, { status: 400 });
  } catch (err) {
    console.error("❌ Error creating task/live:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
