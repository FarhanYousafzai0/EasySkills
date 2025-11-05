import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
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

    // 🧠 Find student's batch
    const student = await Student.findOne({ clerkId }).select("batch");
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const batch = student.batch;
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    // 🎯 Find only future sessions for student's batch
    const sessions = await LiveSession.find({
      batch,
      status: { $in: ["scheduled", "active"] },
      $or: [
        { date: { $gt: currentDate } },
        { date: currentDate, time: { $gt: currentTime } },
      ],
    })
      .sort({ date: 1, time: 1 })
      .select("topic batch date time meetingLink status recurringWeekly");

    // 🧩 Return the next upcoming one only
    const nextSession = sessions[0] || null;

    return NextResponse.json({
      success: true,
      data: nextSession,
    });
  } catch (err) {
    console.error("❌ Error fetching student upcoming session:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
