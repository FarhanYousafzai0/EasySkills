import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/app/models/LiveSession";

export async function GET() {
  await connectDB();
  const sessions = await LiveSession.find();
  return NextResponse.json({ success: true, data: sessions });
}

export async function DELETE(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await LiveSession.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "Live session deleted successfully" });
}

export async function PATCH(req) {
  await connectDB();
  const { id, updates } = await req.json();
  const updated = await LiveSession.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json({ success: true, data: updated });
}
