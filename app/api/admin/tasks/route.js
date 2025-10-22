import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/app/models/Task";

export async function GET() {
  await connectDB();
  const tasks = await Task.find();
  return NextResponse.json({ success: true, data: tasks });
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await Task.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "Task deleted successfully" });
}

export async function PATCH(req) {
  await connectDB();
  const { id, updates } = await req.json();
  const updated = await Task.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json({ success: true, data: updated });
}
