import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";
import Progress from "@/app/models/Progress";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId") || "";

    const course = await Course.findById(params.id);
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });

    let progress = null;
    if (clerkId) progress = await Progress.findOne({ clerkId, courseId: course._id });

    return NextResponse.json({
      success: true,
      data: {
        course,
        progress: progress || { percentage: 0, completedVideos: [], lastWatchedVideo: "" },
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
