import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";
import Progress from "@/app/models/Progress";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId") || "";

    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: "clerkId is required" },
        { status: 400 }
      );
    }

    const courses = await Course.find({ isPublished: true }).select(
      "title description thumbnailUrl category price durationLabel accessTill sections"
    );

    const progressDocs = await Progress.find({ clerkId }).select(
      "courseId percentage"
    );

    const progressMap = new Map(
      progressDocs.map((p) => [String(p.courseId), p.percentage])
    );

    const data = courses.map((c) => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      thumbnailUrl: c.thumbnailUrl,
      category: c.category,
      price: c.price,
      durationLabel: c.durationLabel,
      accessTill: c.accessTill,
      progress: progressMap.get(String(c._id)) || 0,
      totalVideos:
        c.sections?.reduce(
          (acc, s) => acc + (s.items?.length || 0),
          0
        ) || 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
