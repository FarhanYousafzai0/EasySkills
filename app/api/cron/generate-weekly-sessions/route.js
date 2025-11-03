import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/app/models/LiveSession";

export async function GET() {
  try {
    await connectDB();

    const recurring = await LiveSession.find({ recurringWeekly: true });
    let createdCount = 0;

    for (const s of recurring) {
      const sessionDate = new Date(s.date);
      const now = new Date();

      // Skip future sessions
      if (sessionDate > now) continue;

      const nextWeek = new Date(sessionDate);
      nextWeek.setDate(sessionDate.getDate() + 7);
      const nextDateISO = nextWeek.toISOString().split("T")[0];

      const exists = await LiveSession.findOne({
        topic: s.topic,
        batch: s.batch,
        date: nextDateISO,
      });

      if (!exists) {
        await LiveSession.create({
          topic: s.topic,
          batch: s.batch,
          date: nextDateISO,
          time: s.time,
          recurringWeekly: true,
          meetingLink: s.meetingLink,
          notes: s.notes,
          status: "scheduled",
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `✅ Auto-generated ${createdCount} new sessions.`,
    });
  } catch (err) {
    console.error("❌ Cron generation error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
