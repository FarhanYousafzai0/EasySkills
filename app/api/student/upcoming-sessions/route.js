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

    const student = await Student.findOne({ clerkId }).select("batch");
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const batch = student.batch;
    const now = new Date();

    const allSessions = await LiveSession.find({
      batch,
      status: { $in: ["scheduled", "active"] },
    })
      .sort({ date: 1, time: 1 })
      .select("topic batch date time meetingLink status recurringWeekly")
      .lean();

    // ✅ Correct UTC-based comparison
    const upcoming = allSessions.filter((s) => {
      if (!s.date || !s.time) return false;

      // Create a UTC datetime object from date + time
      const baseDate = new Date(s.date);
      const [h, m] = s.time.split(":").map(Number);
      const sessionUTC = Date.UTC(
        baseDate.getUTCFullYear(),
        baseDate.getUTCMonth(),
        baseDate.getUTCDate(),
        h,
        m,
        0
      );

      // Compare against current UTC time
      const nowUTC = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      );

      return sessionUTC > nowUTC; // only keep true future sessions
    });

    const nextSession = upcoming[0] || null;

    if (!nextSession) {
      return NextResponse.json({
        success: true,
        message: "No upcoming session found.",
        data: null,
      });
    }

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
