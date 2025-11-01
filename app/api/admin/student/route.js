import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/app/models/AddStudent";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, plan, batch, joinDate, notes } = body;

    if (!name || !email || !plan || !joinDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Check if already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: "Student already exists" },
        { status: 409 }
      );
    }

    // 2️⃣ Calculate mentorship period
    const join = new Date(joinDate);
    const duration = plan === "1-on-1 Mentorship" ? 30 : 45;
    const mentorshipStart = join;
    const mentorshipEnd = new Date(
      join.getTime() + duration * 24 * 60 * 60 * 1000
    );
    const mentorshipDaysLeft = Math.max(
      0,
      Math.ceil((mentorshipEnd - new Date()) / (1000 * 60 * 60 * 24))
    );

    // 3️⃣ Create Clerk user
    const clerkResponse = await fetch("https://api.clerk.dev/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [email],
        first_name: name,
        skip_password_requirement: true,
        public_metadata: {
          role: "student",
          batch: batch || "Unassigned",
          plan,
          progress: 0,
          totalTasks: 0,
          tasksCompleted: 0,
          issuesReported: 0,
          mentorshipStart,
          mentorshipEnd,
          mentorshipDaysLeft,
        },
      }),
    });

    const clerkUser = await clerkResponse.json();
    if (!clerkResponse.ok || !clerkUser.id)
      throw new Error("Failed to create user in Clerk");

    // 4️⃣ Send email invitation
    await fetch("https://api.clerk.dev/v1/invitations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
      }),
    });

    // 5️⃣ Save to MongoDB
    const student = await Student.create({
      clerkId: clerkUser.id,
      name,
      email,
      phone,
      plan,
      batch: batch || "Unassigned",
      joinDate,
      notes,
      progress: 0,
      totalTasks: 0,
      tasksCompleted: 0,
      issuesReported: 0,
      mentorshipStart,
      mentorshipEnd,
      mentorshipDaysLeft,
      mentorships: [
        {
          plan,
          start: mentorshipStart,
          end: mentorshipEnd,
          daysLeft: mentorshipDaysLeft,
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student added successfully with mentorship tracking!",
        data: student,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating student:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const students = await Student.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: students });
  } catch (err) {
    console.error("Error fetching students:", err);
    return NextResponse.json(
      { success: false, message: "Error fetching students" },
      { status: 500 }
    );
  }
}
