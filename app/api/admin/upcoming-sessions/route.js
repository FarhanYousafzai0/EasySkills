import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/app/models/LiveSession";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const daysParam = parseInt(searchParams.get("days") || "7", 10);
    const days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 1), 30) : 7;
    const batch = searchParams.get("batch") || null;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + days);

    const startISO = start.toISOString().split("T")[0];
    const endISO = end.toISOString().split("T")[0];

    const baseMatch = { status: { $in: ["scheduled", "active"] } };
    if (batch) baseMatch.batch = batch;

    const stringSet = await LiveSession.find({
      ...baseMatch,
      date: { $gte: startISO, $lt: endISO },
    }).lean();

    const dateSet = await LiveSession.find({
      ...baseMatch,
      date: { $gte: start, $lt: end },
    }).lean();

    const seen = new Set();
    const all = [...stringSet, ...dateSet].filter((doc) => {
      const id = String(doc._id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    const normalised = all.map((s) => ({
      ...s,
      __dateStr:
        typeof s.date === "string"
          ? s.date
          : new Date(s.date).toISOString().split("T")[0],
    }));

    normalised.sort((a, b) => {
      if (a.__dateStr !== b.__dateStr) return a.__dateStr < b.__dateStr ? -1 : 1;
      const at = (a.time || "00:00").padStart(5, "0");
      const bt = (b.time || "00:00").padStart(5, "0");
      return at < bt ? -1 : at > bt ? 1 : 0;
    });

    const groupedMap = new Map();
    for (const s of normalised) {
      if (!groupedMap.has(s.__dateStr)) groupedMap.set(s.__dateStr, []);
      groupedMap.get(s.__dateStr).push({
        _id: s._id,
        topic: s.topic,
        batch: s.batch,
        time: s.time,
        meetingLink: s.meetingLink,
        notes: s.notes,
        recurringWeekly: !!s.recurringWeekly,
        status: s.status,
      });
    }

    const data = [...groupedMap.entries()].map(([date, sessions]) => ({
      date,
      sessions,
    }));

    return NextResponse.json({ success: true, days, data });
  } catch (err) {
    console.error("❌ upcoming-sessions error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
