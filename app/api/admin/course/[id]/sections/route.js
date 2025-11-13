import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { title, order = 0 } = await req.json();
    if (!title) return NextResponse.json({ success: false, message: "Section title required" }, { status: 400 });

    const course = await Course.findById(params.id);
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });

    course.sections.push({ title, order, items: [] });
    await course.save();

    return NextResponse.json({ success: true, data: course.sections.at(-1) });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
