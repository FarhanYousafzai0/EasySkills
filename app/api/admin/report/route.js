import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Report from "@/app/models/Report";
import Student from "@/app/models/AddStudent";

// 📄 GET — Fetch all reports with student info
export async function GET() {
  try {
    await connectDB();

    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .select("title description images status feedback studentName studentBatch createdAt");

    return NextResponse.json({ success: true, reports }, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching reports:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 💬 PUT — Add feedback or change status
export async function PUT(req) {
  try {
    await connectDB();
    const { reportId, feedbackMessage, newStatus } = await req.json();

    if (!reportId)
      return NextResponse.json({ success: false, message: "Missing reportId" }, { status: 400 });

    // Update the report
    const update = {};
    if (feedbackMessage) update.$push = { feedback: { message: feedbackMessage, fromAdmin: true } };
    if (newStatus) update.status = newStatus;

    const updated = await Report.findByIdAndUpdate(reportId, update, { new: true });
    if (!updated)
      return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });

    return NextResponse.json(
      { success: true, message: "Report updated successfully", report: updated },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error updating report:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
