import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Admin from "@/app/models/AdminMode";
import Student from "@/app/models/Student";

// ✅ Basic sync (no IP, no device lock)
export async function POST() {
  await connectDB();
  const { userId, sessionClaims } = auth();

  if (!userId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const role = sessionClaims?.publicMetadata?.role || "student";


  let user;
  if (role === "admin") {
    user = await Admin.findOneAndUpdate(
      { clerkId: userId },
      { clerkId: userId, role: "admin" },
      { upsert: true, new: true }
    );
  } else {
    user = await Student.findOneAndUpdate(
      { clerkId: userId },
      { clerkId: userId, role: "student" },
      { upsert: true, new: true }
    );
  }

  // Reflect role in Clerk metadata
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });

  return NextResponse.json({ success: true, role });
}
