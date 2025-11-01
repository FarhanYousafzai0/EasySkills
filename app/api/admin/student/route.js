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

    // 1️⃣ Check if already exists in Mongo
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: "Student already exists" },
        { status: 409 }
      );
    }

    // 2️⃣ Create Clerk User directly through API
    const clerkResponse = await fetch("https://api.clerk.dev/v1/users", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
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
          mentorships: [],
        },
      }),
    });

    const clerkUser = await clerkResponse.json();

    if (!clerkResponse.ok || !clerkUser.id) {
      console.error("❌ Clerk error:", clerkUser);
      throw new Error("Failed to create user in Clerk");
    }

    // 3️⃣ Send Email Invitation to Student
    await fetch("https://api.clerk.dev/v1/invitations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
      }),
    });

    // 4️⃣ Save to MongoDB
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
      mentorships: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student added and invitation sent successfully!",
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
