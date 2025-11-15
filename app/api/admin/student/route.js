import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/app/models/AddStudent";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { 
      name, 
      email, 
      phone, 
      plan, 
      batch, 
      joinDate, 
      notes,
      enrolledCourses = [],       // FIXED
      isEnrolled = false
    } = body;

    if (!name || !email || !plan || !joinDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: "Student already exists" },
        { status: 409 }
      );
    }

    const join = new Date(joinDate);
    const duration = plan === "1-on-1 Mentorship" ? 30 : 45;

    const mentorshipStart = join;
    const mentorshipEnd = new Date(join.getTime() + duration * 86400000);

    const mentorshipDaysLeft = Math.max(
      0,
      Math.ceil((mentorshipEnd - new Date()) / 86400000)
    );

    const isMentorshipActive = mentorshipDaysLeft > 0;

    let clerkUserId = null;
    let invitationLink = "";

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
          enrolledCourses,        // FIXED
          isEnrolled,
          isMentorshipActive,
          mentorshipStart,
          mentorshipEnd,
          mentorshipDaysLeft,
          progress: 0,
          totalTasks: 0,
          tasksCompleted: 0,
          issuesReported: 0
        },
      }),
    });

    const clerkData = await clerkResponse.json();

    if (clerkResponse.ok && clerkData.id) {
      clerkUserId = clerkData.id;
    } else if (clerkData?.errors?.[0]?.code === "form_identifier_exists") {
      const findExisting = await fetch(
        `https://api.clerk.dev/v1/users?email_address=${email}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const findData = await findExisting.json();
      if (Array.isArray(findData) && findData.length > 0) {
        clerkUserId = findData[0].id;

        await fetch(`https://api.clerk.dev/v1/users/${clerkUserId}/metadata`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_metadata: {
              role: "student",
              batch: batch || "Unassigned",
              plan,
              enrolledCourses,    // FIXED
              isEnrolled,
              isMentorshipActive,
              mentorshipStart,
              mentorshipEnd,
              mentorshipDaysLeft
            },
          }),
        });
      }
    }

    if (clerkUserId && clerkResponse.ok) {
      const inviteRes = await fetch("https://api.clerk.dev/v1/invitations", {
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

      const invite = await inviteRes.json();
      if (inviteRes.ok) {
        invitationLink = invite.url;
      }
    }

    const student = await Student.create({
      clerkId: clerkUserId,
      name,
      email,
      phone,
      plan,
      batch: batch || "Unassigned",
      joinDate,
      notes,
      enrolledCourses,        
      isEnrolled,
      isMentorshipActive,
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
        invitationLink,
        data: student
      },
      { status: 201 }
    );

  } catch (err) {
    console.error(err);
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