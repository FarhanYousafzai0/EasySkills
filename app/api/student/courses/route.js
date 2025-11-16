import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";
import Progress from "@/app/models/Progress";
import Student from "@/app/models/AddStudent";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: "clerkId is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Get student first
    const student = await Student.findOne({ clerkId }).select("enrolledCourses");

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 2️⃣ If no enrolled courses → return empty array
    if (!student.enrolledCourses || student.enrolledCourses.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 3️⃣ Fetch ONLY enrolled courses
    const courses = await Course.find({
      _id: { $in: student.enrolledCourses },
      isPublished: true,
    }).select(
      "title description thumbnailUrl category price durationLabel accessTill sections"
    );

    // 4️⃣ Progress system
    const progressDocs = await Progress.find({ clerkId }).select(
      "courseId percentage"
    );

    const progressMap = new Map(
      progressDocs.map((p) => [String(p.courseId), p.percentage])
    );

    // 5️⃣ Prepare final response
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
