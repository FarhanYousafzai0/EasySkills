import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";

/* ---------------------------------------------------
   CREATE SECTION
----------------------------------------------------- */
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { title } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Section title required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(params.id);
    if (!course)
      return NextResponse.json({ success: false, message: "Course not found" });

    course.sections.push({ title: title.trim(), items: [] });
    await course.save();

    return NextResponse.json({
      success: true,
      sections: course.sections,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err.message,
    });
  }
}

/* ---------------------------------------------------
   UPDATE SECTION TITLE
----------------------------------------------------- */
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { sectionId, title } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Section title cannot be empty" },
        { status: 400 }
      );
    }

    const course = await Course.findById(params.id);
    if (!course)
      return NextResponse.json({ success: false, message: "Course not found" });

    const section = course.sections.id(sectionId);
    if (!section)
      return NextResponse.json({ success: false, message: "Section not found" });

    section.title = title.trim();
    await course.save();

    return NextResponse.json({
      success: true,
      sections: course.sections,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err.message,
    });
  }
}

/* ---------------------------------------------------
   DELETE SECTION
----------------------------------------------------- */
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const sectionId = req.nextUrl.searchParams.get("sectionId");
    if (!sectionId)
      return NextResponse.json({
        success: false,
        message: "sectionId required",
      });

    const course = await Course.findById(params.id);
    if (!course)
      return NextResponse.json({ success: false, message: "Course not found" });

    const removed = course.sections.id(sectionId);
    if (!removed)
      return NextResponse.json({ success: false, message: "Section not found" });

    removed.deleteOne();
    await course.save();

    return NextResponse.json({
      success: true,
      sections: course.sections,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err.message,
    });
  }
}
