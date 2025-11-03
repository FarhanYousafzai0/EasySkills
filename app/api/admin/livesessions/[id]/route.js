import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/app/models/LiveSession";

// ✅ DELETE a LiveSession by ID
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing session ID" },
        { status: 400 }
      );
    }

    const deleted = await LiveSession.findByIdAndDelete(id);

    if (!deleted)
      return NextResponse.json(
        { success: false, message: "Live session not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "Live session deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting LiveSession:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ✅ PATCH a LiveSession by ID
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const data = await req.json();

    const updated = await LiveSession.findByIdAndUpdate(id, data, { new: true });

    if (!updated)
      return NextResponse.json(
        { success: false, message: "Live session not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "Live session updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updating LiveSession:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
