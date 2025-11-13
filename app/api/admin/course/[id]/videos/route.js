import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";

/* ---------------------------------------------------
   ADD VIDEO  (POST)
----------------------------------------------------- */
export async function POST(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const {
      sectionId,
      title,
      description = "",
      videoUrl,
      publicId = "",
      duration = 0,
      order = 0,
    } = await req.json();

    if (!sectionId || !title || !videoUrl) {
      return NextResponse.json(
        { success: false, message: "sectionId, title & videoUrl are required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(id);
    if (!course)
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );

    const section = course.sections.id(sectionId);
    if (!section)
      return NextResponse.json(
        { success: false, message: "Section not found" },
        { status: 404 }
      );

    const newVideo = { title, description, videoUrl, publicId, duration, order };
    section.items.push(newVideo);
    await course.save();

    return NextResponse.json({
      success: true,
      message: "Video added",
      video: section.items.at(-1),
      section,
    });
  } catch (err) {
    console.error("ERROR ADDING VIDEO:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

/* ---------------------------------------------------
   UPDATE VIDEO (PUT)
----------------------------------------------------- */
export async function PUT(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const { sectionId, videoId, ...updates } = await req.json();

    if (!sectionId || !videoId) {
      return NextResponse.json(
        { success: false, message: "sectionId & videoId are required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(id);
    if (!course)
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );

    const section = course.sections.id(sectionId);
    if (!section)
      return NextResponse.json(
        { success: false, message: "Section not found" },
        { status: 404 }
      );

    const video = section.items.id(videoId);
    if (!video)
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );

    Object.assign(video, updates);
    await course.save();

    return NextResponse.json({
      success: true,
      message: "Video updated",
      video,
      section,
    });
  } catch (err) {
    console.error("ERROR UPDATING VIDEO:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

/* ---------------------------------------------------
   DELETE VIDEO (DELETE)
----------------------------------------------------- */
export async function DELETE(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const sectionId = req.nextUrl.searchParams.get("sectionId");
    const videoId = req.nextUrl.searchParams.get("videoId");

    if (!sectionId || !videoId) {
      return NextResponse.json(
        { success: false, message: "sectionId & videoId required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(id);
    if (!course)
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );

    const section = course.sections.id(sectionId);
    if (!section)
      return NextResponse.json(
        { success: false, message: "Section not found" },
        { status: 404 }
      );

    const video = section.items.id(videoId);
    if (!video)
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );

    section.items.pull(videoId);
    await course.save();

    return NextResponse.json({
      success: true,
      message: "Video deleted",
      section,
    });
  } catch (err) {
    console.error("ERROR DELETING VIDEO:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
