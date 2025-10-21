import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import Student from "@/lib/models/Student";

// ✅ When user logs in, sync Clerk <-> MongoDB and assign role
export async function POST(req) {
  await dbConnect();

  const { userId } = auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Capture user's IP for device-locking
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // Try to find user in both models
  let dbUser =
    (await Admin.findOne({ clerkId: userId })) ||
    (await Student.findOne({ clerkId: userId }));

  // 1️⃣ If new user, create as Student by default
  if (!dbUser) {
    dbUser = await Student.create({
      clerkId: userId,
      fullName: "New Student",
      email: "",
      role: "student",
      progress: 0,
      totalTasks: 0,
      tasksCompleted: 0,
      issuesReported: 0,
      registeredIp: ip,
    });
  } else {
    // 2️⃣ IP restriction check
    if (dbUser.registeredIp && dbUser.registeredIp !== ip) {
      return NextResponse.json(
        { error: "Account already active on another device or IP." },
        { status: 403 }
      );
    }

    // Store IP if missing
    if (!dbUser.registeredIp) {
      dbUser.registeredIp = ip;
      await dbUser.save();
    }
  }

  // 3️⃣ Update Clerk metadata with current role
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role: dbUser.role },
  });

  return NextResponse.json(
    {
      success: true,
      role: dbUser.role,
      ip: dbUser.registeredIp,
    },
    { status: 200 }
  );
}
