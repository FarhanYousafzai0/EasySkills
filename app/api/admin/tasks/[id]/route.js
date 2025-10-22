import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/app/models/Task";

// ✅ DELETE a task by ID
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const deleted = await Task.findByIdAndDelete(id);

    if (!deleted)
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting task:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ✅ Update (optional)
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const data = await req.json();
    const updated = await Task.findByIdAndUpdate(id, data, { new: true });

    if (!updated)
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Task updated", data: updated });
  } catch (err) {
    console.error("❌ Error updating task:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
