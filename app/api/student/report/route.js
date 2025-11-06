import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Report from "@/app/models/Report";
import Student from "@/app/models/AddStudent";

export async function POST(req) {
  try {
    await connectDB();
    const { clerkId, title, description, images } = await req.json();

    if (!clerkId || !title || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🧠 Find student
    const student = await Student.findOne({ clerkId });
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 🧩 Normalize uploaded image data
    const imageData = Array.isArray(images)
      ? images.map((img) => ({
          fileUrl: img.fileUrl || img.url || "",
          filePublicId: img.filePublicId || img.public_id || "",
          originalName: img.originalName || img.name || "unnamed",
        }))
      : [];

    // 🧱 Create Report
    const newReport = await Report.create({
      studentId: student._id,
      title,
      description,
      images: imageData.map((f) => f.fileUrl),
      status: "pending",
    });

    return NextResponse.json(
      { success: true, message: "Issue reported successfully", data: newReport },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error creating report:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}




// Get



export async function GET(req) {
    try {
      await connectDB();
      const { searchParams } = new URL(req.url);
      const clerkId = searchParams.get("clerkId");
  
      if (!clerkId) {
        return NextResponse.json(
          { success: false, message: "Missing clerkId" },
          { status: 400 }
        );
      }
  
      const student = await Student.findOne({ clerkId });
      if (!student)
        return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
  
      // 🧩 Fetch reports sorted by latest
      const reports = await Report.find({ studentId: student._id })
        .sort({ createdAt: -1 })
        .select("title description status feedback createdAt images");
  
      return NextResponse.json({ success: true, reports }, { status: 200 });
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }