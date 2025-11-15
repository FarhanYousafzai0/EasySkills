import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/app/models/AddStudent";
import { clerkClient } from "@clerk/nextjs/server";

export async function PUT(req, { params }) {
  try {
    await connectDB();


    const resolvedParams = await params;
    const studentId = resolvedParams.id;
    
    const body = await req.json();
    const days = Number(body.days);

    if (!days || days <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid mentorship days" },
        { status: 400 }
      );
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    if (!student.clerkId) {
      return NextResponse.json(
        { success: false, message: "Student does not have Clerk ID" },
        { status: 400 }
      );
    }

    // New dates
    const now = new Date();
    const start = now;
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Update MONGO
    student.mentorshipStart = start;
    student.mentorshipEnd = end;
    student.mentorshipDaysLeft = days;
    student.isMentorshipActive = true;

    await student.save();

    // FIX: Call clerkClient as a function, then access users
    const client = await clerkClient();
    await client.users.updateUser(student.clerkId, {
      publicMetadata: {
        mentorshipStart: start.toISOString(),
        mentorshipEnd: end.toISOString(),
        mentorshipDaysLeft: days,
        isMentorshipActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mentorship renewed successfully",
      data: {
        id: student._id,
        mentorshipStart: student.mentorshipStart,
        mentorshipEnd: student.mentorshipEnd,
        mentorshipDaysLeft: student.mentorshipDaysLeft,
      },
    });
  } catch (err) {
    console.error("Renew error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
