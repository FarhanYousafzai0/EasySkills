import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Batch from "@/app/models/Batch";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    await Batch.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Batch deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting batch:", error);
    return NextResponse.json({ success: false, message: "Server Error", error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const updatedBatch = await Batch.findByIdAndUpdate(id, body, { new: true });
    if (!updatedBatch)
      return NextResponse.json({ success: false, message: "Batch not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updatedBatch }, { status: 200 });
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json({ success: false, message: "Server Error", error: error.message }, { status: 500 });
  }
}
