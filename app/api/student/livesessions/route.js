import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/app/models/LiveSession";
import Student from "@/app/models/AddStudent";

export async function GET(req) {
  try {
    await connectDB();

    // 1️⃣ Parse batch from query OR Clerk metadata (later on frontend)
    const { searchParams } = new URL(req.url);
    const batch = searchParams.get("batch");

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "Batch parameter missing" },
        { status: 400 }
      );
    }

    // 2️⃣ Fetch all sessions matching the batch
    const sessions = await LiveSession.find({ batch })
      .sort({ date: 1 })
      .select("topic batch date time meetingLink status");

    if (!sessions.length) {
      return NextResponse.json({
        success: true,
        message: "No sessions found for this batch",
        data: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    console.error("Error fetching live sessions:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
