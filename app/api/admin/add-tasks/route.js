import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/app/models/Task";
import LiveSession from "@/app/models/LiveSession";

export async function POST(req) {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();

    // 2️⃣ Parse the incoming request JSON
    const data = await req.json();

    // 3️⃣ Dummy fallback authentication for testing
    const userId = "dummy-admin";
    const role = "admin"; // Pretend this is an admin user

    // 4️⃣ Handle Task creation
    if (data.kind === "task") {
      const newTask = await Task.create({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        tags: data.tags,
        batches: data.batches,
        status: data.status || "active",
        createdBy: userId,
      });

      return NextResponse.json(
        {
          success: true,
          type: "task",
          message: "✅ Task created successfully",
          data: newTask,
        },
        { status: 201 }
      );
    }

    // 5️⃣ Handle Live Session creation
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
        createdBy: userId,
      });

      return NextResponse.json(
        {
          success: true,
          type: "live",
          message: "✅ Live session created successfully",
          data: newSession,
        },
        { status: 201 }
      );
    }

    // 6️⃣ Invalid payload
    return NextResponse.json(
      { success: false, message: "Invalid payload: Missing kind" },
      { status: 400 }
    );
  } catch (err) {
    console.error("❌ Error creating item:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
