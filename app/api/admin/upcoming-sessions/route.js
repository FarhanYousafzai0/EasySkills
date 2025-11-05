import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/app/models/LiveSession";

export async function GET(req) {
  try {
    await connectDB();

    // Parse optional query params
    const { searchParams } = new URL(req.url);
    const daysParam = parseInt(searchParams.get("days") || "7", 10);
    const days = Number.isFinite(daysParam)
      ? Math.min(Math.max(daysParam, 1), 30)
      : 7;

    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Compute upcoming date window
    const end = new Date(now);
    end.setDate(now.getDate() + days);

    // Base query: fetch active/upcoming only
    const baseMatch = {
      status: { $in: ["scheduled", "active"] },
      $or: [
        { date: { $gt: currentDate } },
        { date: currentDate, time: { $gt: currentTime } },
      ],
    };

    // Fetch sessions (supporting both ISO strings and Date objects)
    const sessions = await LiveSession.find(baseMatch)
      .sort({ date: 1, time: 1 })
      .select("topic batch date time meetingLink notes recurringWeekly status")
      .lean();

    if (!sessions.length) {
      return NextResponse.json({
        success: true,
        message: "No upcoming sessions found.",
        data: [],
      });
    }

    // Normalize and format
    const formatted = sessions.map((s) => ({
      _id: s._id,
      topic: s.topic,
      batch: s.batch,
      time: s.time,
      meetingLink: s.meetingLink,
      notes: s.notes || "",
      recurringWeekly: !!s.recurringWeekly,
      status: s.status,
      date:
        typeof s.date === "string"
          ? s.date
          : new Date(s.date).toISOString().split("T")[0],
    }));

    // Group by date
    const groupedMap = new Map();
    for (const s of formatted) {
      if (!groupedMap.has(s.date)) groupedMap.set(s.date, []);
      groupedMap.get(s.date).push(s);
    }

    const data = [...groupedMap.entries()].map(([date, sessions]) => ({
      date,
      sessions,
    }));

    return NextResponse.json({
      success: true,
      message: "Upcoming sessions fetched successfully.",
      days,
      total: sessions.length,
      data,
    });
  } catch (err) {
    console.error("❌ Error fetching admin upcoming sessions:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
