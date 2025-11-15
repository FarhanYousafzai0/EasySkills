import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/app/models/AddStudent";
import nodemailer from 'nodemailer';

// ==========================================
// 📧 EMAIL CONFIGURATION
// ==========================================
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ==========================================
// 📧 EMAIL TEMPLATE - INVITATION (NEW USER)
// ==========================================
async function sendInvitationEmail(name, email, plan, batch, duration, mentorshipStart, mentorshipEnd, invitationLink, courseIds) {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9380FD 0%, #7866FA 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #9380FD 0%, #7866FA 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .details { background: white; padding: 15px; border-left: 4px solid #9380FD; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Welcome, ${name}!</h1>
            <p>You've been enrolled in our ${plan}</p>
          </div>
          
          <div class="content">
            <p>Hi ${name},</p>
            <p>We're excited to have you join our mentorship program! Your learning journey starts now.</p>
            
            <div class="details">
              <h3>📋 Your Details:</h3>
              <p><strong>Plan:</strong> ${plan}</p>
              <p><strong>Batch:</strong> ${batch || 'Not assigned'}</p>
              <p><strong>Duration:</strong> ${duration} days</p>
              <p><strong>Start Date:</strong> ${mentorshipStart.toLocaleDateString()}</p>
              <p><strong>End Date:</strong> ${mentorshipEnd.toLocaleDateString()}</p>
              ${courseIds.length > 0 ? `<p><strong>Enrolled Courses:</strong> ${courseIds.length}</p>` : ''}
            </div>
            
            <p>Click the button below to set up your account and get started:</p>
            
            <center>
              <a href="${invitationLink}" class="button">
                🚀 Set Up Your Account
              </a>
            </center>
            
            <p><small>This link will expire in 7 days. If you didn't request this, please ignore this email.</small></p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Your Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    console.log('📧 Sending invitation email to:', email);

    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Transporter verified');

    const info = await transporter.sendMail({
      from: `"Your Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to the ${plan}! 🎉`,
      html: emailHTML,
    });

    console.log('✅ Invitation email sent! Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Invitation email failed:', error.message);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 📧 EMAIL TEMPLATE - WELCOME BACK (EXISTING USER)
// ==========================================
async function sendWelcomeBackEmail(name, email, plan, batch, duration, mentorshipStart, mentorshipEnd, courseIds) {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9380FD 0%, #7866FA 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #9380FD 0%, #7866FA 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .details { background: white; padding: 15px; border-left: 4px solid #9380FD; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome Back, ${name}!</h1>
            <p>Your mentorship has been renewed</p>
          </div>
          
          <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! You've been re-enrolled in our <strong>${plan}</strong>.</p>
            
            <div class="details">
              <h3>📋 Updated Details:</h3>
              <p><strong>Plan:</strong> ${plan}</p>
              <p><strong>Batch:</strong> ${batch || 'Not assigned'}</p>
              <p><strong>Duration:</strong> ${duration} days</p>
              <p><strong>Start Date:</strong> ${mentorshipStart.toLocaleDateString()}</p>
              <p><strong>End Date:</strong> ${mentorshipEnd.toLocaleDateString()}</p>
              ${courseIds.length > 0 ? `<p><strong>Enrolled Courses:</strong> ${courseIds.length}</p>` : ''}
            </div>
            
            <p>You can continue using your existing account. Simply sign in to access your updated mentorship:</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/sign-in" class="button">
                🚀 Sign In to Your Account
              </a>
            </center>
            
            <p><small>If you have any questions, please contact our support team.</small></p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Your Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    console.log('📧 Sending welcome back email to:', email);

    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Transporter verified');

    const info = await transporter.sendMail({
      from: `"Your Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your ${plan} Has Been Renewed! 🎉`,
      html: emailHTML,
    });

    console.log('✅ Welcome back email sent! Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Welcome back email failed:', error.message);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 🎓 STUDENT CREATION API
// ==========================================
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
      enrolledCourses = [],
      isEnrolled = false
    } = body;

    console.log('📥 Received data:', { name, email, enrolledCourses, isEnrolled });

    // ✅ Validation
    if (!name || !email || !plan || !joinDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Check if student already exists in MongoDB
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: "Student already exists in database" },
        { status: 409 }
      );
    }

    // ✅ Calculate mentorship dates
    const join = new Date(joinDate);
    const duration = plan === "1-on-1 Mentorship" ? 30 : 45;

    const mentorshipStart = join;
    const mentorshipEnd = new Date(join.getTime() + duration * 86400000);

    const mentorshipDaysLeft = Math.max(
      0,
      Math.ceil((mentorshipEnd - new Date()) / 86400000)
    );

    const isMentorshipActive = mentorshipDaysLeft > 0;

    // ✅ Clean enrolledCourses array
    const courseIds = Array.isArray(enrolledCourses) 
      ? enrolledCourses.filter(id => typeof id === 'string' && id.trim() !== '')
      : [];

    // ✅ Auto-set isEnrolled based on courses
    const finalIsEnrolled = courseIds.length > 0 ? true : isEnrolled;

    console.log('📚 Enrolled Courses:', courseIds);
    console.log('✅ isEnrolled:', finalIsEnrolled);

    let clerkUserId = null;
    let invitationLink = "";
    let emailSent = false;
    let emailError = null;

    // ✅ Create user in Clerk
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
        skip_password_checks: true,
        public_metadata: {
          role: "student",
          batch: batch || "Unassigned",
          plan,
          enrolledCourses: courseIds,
          isEnrolled: finalIsEnrolled,
          isMentorshipActive,
          mentorshipStart: mentorshipStart.toISOString(),
          mentorshipEnd: mentorshipEnd.toISOString(),
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
      console.log('✅ Clerk user created:', clerkUserId);
    } else if (clerkData?.errors?.[0]?.code === "form_identifier_exists") {
      console.log('⚠️ User already exists in Clerk, fetching...');
      const findExisting = await fetch(
        `https://api.clerk.dev/v1/users?email_address=${encodeURIComponent(email)}`,
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
              enrolledCourses: courseIds,
              isEnrolled: finalIsEnrolled,
              isMentorshipActive,
              mentorshipStart: mentorshipStart.toISOString(),
              mentorshipEnd: mentorshipEnd.toISOString(),
              mentorshipDaysLeft
            },
          }),
        });
        console.log('✅ Updated existing Clerk user metadata');
      }
    }

    // ✅ Create invitation or send welcome back email
    if (clerkUserId) {
      try {
        const inviteRes = await fetch("https://api.clerk.dev/v1/invitations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: email,
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
            notify: false,
          }),
        });

        const invite = await inviteRes.json();
        
        if (inviteRes.ok && invite.url) {
          // ✅ NEW USER - Send invitation
          invitationLink = invite.url;
          console.log('✅ Invitation created:', invitationLink);

          const emailResult = await sendInvitationEmail(
            name, email, plan, batch, duration, 
            mentorshipStart, mentorshipEnd, invitationLink, courseIds
          );

          emailSent = emailResult.success;
          emailError = emailResult.error;
          
        } else if (invite?.errors?.[0]?.code === 'form_identifier_exists') {
          // ✅ EXISTING USER - Send welcome back
          console.log('⚠️ User already has Clerk account, sending welcome email...');
          
          invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`;
          
          const emailResult = await sendWelcomeBackEmail(
            name, email, plan, batch, duration, 
            mentorshipStart, mentorshipEnd, courseIds
          );

          emailSent = emailResult.success;
          emailError = emailResult.error;
          
        } else {
          console.error('❌ Invitation creation failed:', invite);
          emailError = 'Invitation creation failed';
        }
      } catch (inviteError) {
        console.error('❌ Invitation error:', inviteError);
        emailError = inviteError.message;
      }
    }

    // ✅ Save to MongoDB
    const studentData = {
      clerkId: clerkUserId,
      name,
      email,
      phone: phone || "",
      plan,
      batch: batch || "Unassigned",
      joinDate: mentorshipStart,
      notes: notes || "",
      enrolledCourses: courseIds,
      isEnrolled: finalIsEnrolled,
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
    };

    const student = await Student.create(studentData);

    console.log('✅ Student created in MongoDB:', {
      id: student._id,
      enrolledCourses: student.enrolledCourses,
      isEnrolled: student.isEnrolled,
    });

    return NextResponse.json(
      {
        success: true,
        message: emailSent 
          ? "Student added and email sent successfully!" 
          : `Student added! Email failed: ${emailError || 'Unknown error'}`,
        invitationLink,
        emailSent,
        emailError,
        data: {
          _id: student._id,
          name: student.name,
          email: student.email,
          enrolledCourses: student.enrolledCourses,
          isEnrolled: student.isEnrolled,
          clerkId: student.clerkId
        }
      },
      { status: 201 }
    );

  } catch (err) {
    console.error('❌ Error creating student:', err);
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