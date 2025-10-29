import Batch from "@/app/models/Batch";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";



export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, description, startDate, endDate } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    const newBatch = await Batch.create({ title, description, startDate, endDate });
    return NextResponse.json({ success: true, data: newBatch }, { status: 201 });
  } catch (error) {
    console.error("Error adding batch:", error);
    return NextResponse.json({ success: false, message: "Server Error", error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const batches = await Batch.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: batches }, { status: 200 });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json({ success: false, message: "Server Error", error: error.message }, { status: 500 });
  }
}
