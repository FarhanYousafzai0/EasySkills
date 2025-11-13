import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { sectionId, title, description = "", videoUrl, publicId = "", duration = 0, order = 0 } = await req.json();

    if (!sectionId || !title || !videoUrl)
      return NextResponse.json({ success: false, message: "sectionId, title and videoUrl are required" }, { status: 400 });

    const course = await Course.findById(params.id);
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });

    const section = course.sections.id(sectionId);
    if (!section) return NextResponse.json({ success: false, message: "Section not found" }, { status: 404 });

    section.items.push({ title, description, videoUrl, publicId, duration, order });
    await course.save();

    return NextResponse.json({ success: true, data: section.items.at(-1) });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
