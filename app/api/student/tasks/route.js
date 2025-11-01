import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/app/models/Task";


export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const batch = searchParams.get("batch");

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch parameter missing" },
        { status: 400 }
      );
    }

    // Fetch tasks belonging to the student's batch
    const tasks = await Task.find({ batches: { $in: [batch] } })
      .sort({ dueDate: 1 })
      .select("title description dueDate priority status");

    return NextResponse.json({ success: true, data: tasks });
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
