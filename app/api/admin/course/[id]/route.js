import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const course = await Course.findById(params.id);
    if (!course) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: course });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const updates = await req.json();
    const updated = await Course.findByIdAndUpdate(params.id, updates, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const exists = await Course.findById(params.id).select("_id");
    if (!exists) return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    await Course.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Course deleted" });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
