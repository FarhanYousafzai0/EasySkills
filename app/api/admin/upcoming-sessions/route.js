import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/app/models/LiveSession";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const daysParam = parseInt(searchParams.get("days") || "7", 10);
    const days = Number.isFinite(daysParam)
      ? Math.min(Math.max(daysParam, 1), 30)
      : 7;

    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + days);

    // Fetch all relevant sessions first
    const allSessions = await LiveSession.find({
      status: { $in: ["scheduled", "active"] },
    })
      .sort({ date: 1, time: 1 })
      .select("topic batch date time meetingLink notes recurringWeekly status")
      .lean();

    // ✅ Combine date + time and filter properly
    const upcoming = allSessions.filter((s) => {
      if (!s.date || !s.time) return false;
      const dt = new Date(s.date);
      const [h, m] = s.time.split(":").map(Number);
      dt.setHours(h, m, 0, 0);
      return dt > now && dt <= end;
    });

    if (!upcoming.length) {
      return NextResponse.json({
        success: true,
        message: "No upcoming sessions found.",
        data: [],
      });
    }

    // Format sessions
    const formatted = upcoming.map((s) => ({
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
      total: upcoming.length,
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
