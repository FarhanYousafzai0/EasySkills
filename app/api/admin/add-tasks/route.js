import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Task from "@/lib/models/Task";
import LiveSession from "@/lib/models/LiveSession";

export async function POST(req) {
  try {
    await connectDB();
    const { userId, sessionClaims } = auth();

    if (!userId)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const role = sessionClaims?.metadata?.role || sessionClaims?.public_metadata?.role;
    if (role !== "admin")
      return NextResponse.json({ success: false, message: "Forbidden: Admin access only" }, { status: 403 });

    const data = await req.json();

    if (data.kind === "task") {
      const newTask = await Task.create({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        tags: data.tags,
        batches: data.batches,
        status: data.status,
        createdBy: userId,
      });
      return NextResponse.json({
        success: true,
        type: "task",
        message: "Task created successfully",
        data: newTask,
      });
    }

    if (data.kind === "live") {
      const newSession = await LiveSession.create({
        topic: data.topic,
        batch: data.batch,
        date: data.date,
        time: data.time,
        recurringWeekly: data.recurringWeekly,
        meetingLink: data.meetingLink,
        notes: data.notes,
        status: data.status,
        createdBy: userId,
      });
      return NextResponse.json({
        success: true,
        type: "live",
        message: "Live session created successfully",
        data: newSession,
      });
    }

    return NextResponse.json({ success: false, message: "Invalid payload: Missing kind" }, { status: 400 });
  } catch (err) {
    console.error("❌ Error creating item:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
