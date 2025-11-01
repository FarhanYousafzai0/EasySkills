import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/app/models/AddStudent";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, plan, batch, joinDate, notes } = body;

    // ✅ Validation
    if (!name || !email || !plan || !joinDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Check existing Mongo record
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: "Student already exists" },
        { status: 409 }
      );
    }

    // ✅ Calculate mentorship details
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

    let clerkUserId = null;
    let invitationLink = "";

    // ✅ 1️⃣ Try to create user in Clerk
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

    if (clerkResponse.ok && clerkUser.id) {
      clerkUserId = clerkUser.id;
      console.log("✅ Clerk user created:", clerkUser.id);
    } else if (
      clerkUser.errors?.[0]?.code === "form_identifier_exists" ||
      clerkUser.errors?.[0]?.message?.includes("taken")
    ) {
      // 🔁 Fetch existing user instead
      const existing = await fetch(
        `https://api.clerk.dev/v1/users?email_address=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await existing.json();
      if (Array.isArray(data) && data.length > 0) {
        clerkUserId = data[0].id;
        console.log("ℹ️ Clerk user already exists:", clerkUserId);
      } else {
        throw new Error("Failed to fetch existing Clerk user.");
      }
    } else {
      console.error("❌ Clerk user creation failed:", clerkUser);
      throw new Error("Failed to create user in Clerk");
    }

    // ✅ 2️⃣ Attempt invitation (only if new user was created)
    if (clerkResponse.ok && clerkUser.id) {
      try {
        const inviteResponse = await fetch("https://api.clerk.dev/v1/invitations", {
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

        const inviteData = await inviteResponse.json();
        if (inviteResponse.ok) {
          invitationLink = inviteData.url || "";
          console.log("📧 Invitation sent:", invitationLink);
        } else {
          console.warn("⚠️ Invitation skipped:", inviteData.errors?.[0]?.message);
        }
      } catch (e) {
        console.warn("⚠️ Invitation request failed:", e.message);
      }
    }

    // ✅ 3️⃣ Save to MongoDB
    const student = await Student.create({
      clerkId: clerkUserId,
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
      inviteLink: invitationLink,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student added successfully!",
        invitationLink: invitationLink || null,
        data: student,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error creating student:", err);
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
