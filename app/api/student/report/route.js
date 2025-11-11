// app/api/student/report/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Report from "@/app/models/Report";
import Student from "@/app/models/AddStudent";

// ──────────────────────────────
// 📦 POST – Create New Report
// ──────────────────────────────
export async function POST(req) {
  try {
    await connectDB();
    const { clerkId, title, description, images } = await req.json();

    if (!clerkId || !title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (clerkId, title, or description)" },
        { status: 400 }
      );
    }

    // 🧠 Find student (get name + batch)
    const student = await Student.findOne({ clerkId }).select("name batch");
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 🖼️ Normalize uploaded images
    const imageData = Array.isArray(images)
      ? images.map((img) => ({
          fileUrl: img.fileUrl || img.url || "",
          filePublicId: img.filePublicId || img.public_id || "",
          originalName: img.originalName || img.name || "unnamed",
        }))
      : [];

    // 🧱 Create the report (with inline student info)
    const newReport = await Report.create({
      studentId: student._id,
      studentName: student.name || "Unknown Student",
      studentBatch: student.batch || "Unassigned",
      title: title.trim(),
      description: description.trim(),
      images: imageData.map((f) => f.fileUrl),
      status: "pending",
    });

    return NextResponse.json(
      { success: true, message: "✅ Issue reported successfully", data: newReport },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error creating report:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error while creating report" },
      { status: 500 }
    );
  }
}

// ──────────────────────────────
// 📄 GET – Fetch All Reports for a Student
// ──────────────────────────────
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: "Missing clerkId in request" },
        { status: 400 }
      );
    }

    const student = await Student.findOne({ clerkId });
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Fetch all reports for this student
    const reports = await Report.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .select("title description status feedback createdAt images studentName studentBatch");

    return NextResponse.json(
      { success: true, count: reports.length, reports },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error fetching reports:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error while fetching reports" },
      { status: 500 }
    );
  }
}
