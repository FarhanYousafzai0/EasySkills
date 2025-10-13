import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import Student from "@/lib/models/Student";

export async function POST() {
  try {
    // 1️⃣ Authenticate the current Clerk user
    const { userId, sessionClaims } = auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    // 2️⃣ Connect to MongoDB
    await connectDB();

    // 3️⃣ Extract role and metadata from Clerk
    const role = sessionClaims?.metadata?.role || "student"; // default role = student
    const fullName = sessionClaims?.metadata?.fullName || "Unknown User";
    const email = sessionClaims?.email || sessionClaims?.metadata?.email;
    const batch = sessionClaims?.metadata?.batch || "Unassigned";
    const mentorships = sessionClaims?.metadata?.mentorships || [];

    // 4️⃣ If admin → ensure in Admin collection
    if (role === "admin") {
      const existingAdmin = await Admin.findOne({ clerkId: userId });

      if (!existingAdmin) {
        await Admin.create({
          clerkId: userId,
          fullName,
          email,
          role: "admin",
        });
      } else {
        existingAdmin.fullName = fullName;
        existingAdmin.email = email;
        await existingAdmin.save();
      }
    }

    // 5️⃣ If student → ensure in Student collection
    else {
      const existingStudent = await Student.findOne({ clerkId: userId });

      if (!existingStudent) {
        await Student.create({
          clerkId: userId,
          fullName,
          email,
          batch,
          mentorships,
        });
      } else {
        existingStudent.fullName = fullName;
        existingStudent.email = email;
        existingStudent.batch = batch;
        existingStudent.mentorships = mentorships;
        await existingStudent.save();
      }
    }

    // 6️⃣ Return success response
    return new Response(JSON.stringify({ success: true, role }), { status: 200 });

  } catch (error) {
    console.error("❌ sync-user error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
