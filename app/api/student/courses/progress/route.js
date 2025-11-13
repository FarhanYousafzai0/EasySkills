import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Progress from "@/app/models/Progress";
import { computePercentage } from "@/lib/progress";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId") || "";
    const courseId = searchParams.get("courseId") || "";

    if (!clerkId || !courseId)
      return NextResponse.json({ success: false, message: "clerkId and courseId are required" }, { status: 400 });

    const prog = await Progress.findOne({ clerkId, courseId });
    return NextResponse.json({ success: true, data: prog || null });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// body: { clerkId, courseId, videoId, completed: boolean, lastWatchedVideo? }
export async function POST(req) {
  try {
    await connectDB();
    const { clerkId, courseId, videoId, completed, lastWatchedVideo = "" } = await req.json();

    if (!clerkId || !courseId || !videoId)
      return NextResponse.json({ success: false, message: "clerkId, courseId, videoId required" }, { status: 400 });

    const prog =
      (await Progress.findOne({ clerkId, courseId })) ||
      (await Progress.create({ clerkId, courseId, completedVideos: [], percentage: 0 }));

    const set = new Set(prog.completedVideos);
    if (completed) set.add(videoId);
    else set.delete(videoId);

    prog.completedVideos = Array.from(set);
    if (lastWatchedVideo) prog.lastWatchedVideo = lastWatchedVideo;

    prog.percentage = await computePercentage(clerkId, courseId);
    await prog.save();

    return NextResponse.json({ success: true, data: prog });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
