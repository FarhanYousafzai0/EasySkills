import { NextResponse } from "next/server";
import AddStudent from "@/app/models/AddStudent";
import { connectDB } from "@/lib/mongodb";

export async function PUT(req, context) {
  try {
    await connectDB();
    const { id } = await context.params; 
    const body = await req.json();

    const updated = await AddStudent.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating student:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const deleted = await AddStudent.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting student:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
