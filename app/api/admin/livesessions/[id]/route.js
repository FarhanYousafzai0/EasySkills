import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/app/models/LiveSession";

// ✅ DELETE: Remove a live session by ID
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing session ID" }, { status: 400 });
    }

    const deleted = await LiveSession.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Live session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Live session deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting live session:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ✅ PATCH: Update session fields
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const updates = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing session ID" }, { status: 400 });
    }

    const updated = await LiveSession.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: "Live session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Error updating live session:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
