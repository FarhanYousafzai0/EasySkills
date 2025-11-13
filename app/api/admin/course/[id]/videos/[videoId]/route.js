import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const updates = await req.json();
    const course = await Course.findById(params.id);
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });

    const section = course.sections.find((s) => s.items.id(params.videoId));
    if (!section) return NextResponse.json({ success: false, message: "Video not found" }, { status: 404 });

    const video = section.items.id(params.videoId); 
    Object.assign(video, updates);
    await course.save();

    return NextResponse.json({ success: true, data: video });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const course = await Course.findById(params.id);
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });

    const section = course.sections.find((s) => s.items.id(params.videoId));
    if (!section) return NextResponse.json({ success: false, message: "Video not found" }, { status: 404 });

    section.items.id(params.videoId).deleteOne();
    await course.save();

    return NextResponse.json({ success: true, message: "Video removed" });
        } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
