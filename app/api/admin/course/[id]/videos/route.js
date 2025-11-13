import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";

/* ---------------------------------------------------
   ADD VIDEO (POST)
----------------------------------------------------- */
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { sectionId, title, description = "", videoUrl, publicId = "", duration = "", order = 0 } =
      await req.json();

    if (!sectionId || !title?.trim() || !videoUrl?.trim()) {
      return NextResponse.json(
        { success: false, message: "sectionId, title & videoUrl are required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(params.id);
    if (!course)
      return NextResponse.json({ success: false, message: "Course not found" });

    const section = course.sections.id(sectionId);
    if (!section)
      return NextResponse.json({ success: false, message: "Section not found" });

    section.items.push({
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      publicId,
      duration,
      order,
    });

    await course.save();

    return NextResponse.json({
      success: true,
      sections: course.sections,
    });
  } catch (err) {
    console.error("ERROR ADDING VIDEO:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}

/* ---------------------------------------------------
   UPDATE VIDEO (PUT)
----------------------------------------------------- */
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { sectionId, videoId, ...updates } = await req.json();

    if (!sectionId || !videoId) {
      return NextResponse.json(
        { success: false, message: "sectionId & videoId are required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(params.id);
    if (!course)
      return NextResponse.json({ success: false, message: "Course not found" });

    const section = course.sections.id(sectionId);
    if (!section)
      return NextResponse.json({ success: false, message: "Section not found" });

    const video = section.items.id(videoId);
    if (!video)
      return NextResponse.json({ success: false, message: "Video not found" });

    Object.assign(video, updates);
    await course.save();

    return NextResponse.json({
      success: true,
      sections: course.sections,
    });
  } catch (err) {
    console.error("ERROR UPDATING VIDEO:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}

/* ---------------------------------------------------
   DELETE VIDEO (DELETE)
----------------------------------------------------- */
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const sectionId = req.nextUrl.searchParams.get("sectionId");
    const videoId = req.nextUrl.searchParams.get("videoId");

    if (!sectionId || !videoId) {
      return NextResponse.json(
        { success: false, message: "sectionId & videoId required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(params.id);
    if (!course)
      return NextResponse.json({ success: false, message: "Course not found" });

    const section = course.sections.id(sectionId);
    if (!section)
      return NextResponse.json({ success: false, message: "Section not found" });

    const video = section.items.id(videoId);
    if (!video)
      return NextResponse.json({ success: false, message: "Video not found" });

    video.deleteOne();
    await course.save();

    return NextResponse.json({
      success: true,
      sections: course.sections,
    });
  } catch (err) {
    console.error("ERROR DELETING VIDEO:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
