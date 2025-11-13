import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";
import Progress from "@/app/models/Progress";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId") || "";

    const course = await Course.findById(params.id).lean();
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    const sections = course.sections || [];
    const totalVideos =
      sections.reduce((acc, s) => acc + (s.items?.length || 0), 0) || 0;

    let progressDoc = null;
    if (clerkId) {
      progressDoc = await Progress.findOne({
        clerkId,
        courseId: course._id,
      }).lean();
    }

    const progress = {
      percentage: progressDoc?.percentage || 0,
      completedVideos: progressDoc?.completedVideos || [],
      lastWatchedVideo: progressDoc?.lastWatchedVideo || "",
    };

    // Decide current video
    let currentVideoId = progress.lastWatchedVideo || "";

    if (!currentVideoId) {
      for (const sec of sections) {
        if (sec.items?.length) {
          currentVideoId = String(sec.items[0]._id);
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        course: {
          ...course,
          totalVideos,
        },
        sections,
        progress,
        currentVideoId,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
