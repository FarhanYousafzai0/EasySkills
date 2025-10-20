import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/app/models/Admin";
import Student from "@/app/models/Student";

export async function POST(req) {
  try {
    await connectDB();

    const { userId, sessionClaims } = auth();
    if (!userId)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    // ✅ Extract IP address safely (works on Vercel & localhost)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const email =
      sessionClaims?.email_addresses?.[0]?.email_address ||
      sessionClaims?.email ||
      "unknown@user.com";
    const fullName =
      sessionClaims?.full_name ||
      `${sessionClaims?.first_name || ""} ${sessionClaims?.last_name || ""}`.trim() ||
      "Unnamed User";

    const role =
      sessionClaims?.metadata?.role ||
      sessionClaims?.publicMetadata?.role ||
      "student";

    let userDoc;

    // ✅ Handle Admin
    if (role === "admin") {
      const existing = await Admin.findOne({ clerkId: userId });

      // Check IP conflict
      if (existing && existing.ipAddress && existing.ipAddress !== ip) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Access denied: this account is already logged in from another device/IP. Please log out there first.",
          },
          { status: 403 }
        );
      }

      userDoc = await Admin.findOneAndUpdate(
        { clerkId: userId },
        {
          clerkId: userId,
          fullName,
          email,
          role: "admin",
          ipAddress: ip, // ✅ store IP
          lastLogin: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    // ✅ Handle Student
    else {
      const existing = await Student.findOne({ clerkId: userId });

      if (existing && existing.ipAddress && existing.ipAddress !== ip) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Access denied: this account is already logged in from another IP address.",
          },
          { status: 403 }
        );
      }

      userDoc = await Student.findOneAndUpdate(
        { clerkId: userId },
        {
          clerkId: userId,
          fullName,
          email,
          batch: "Unassigned",
          ipAddress: ip, // ✅ store IP
          lastLogin: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User synced successfully",
        role: userDoc.role || role,
        ip: userDoc.ipAddress,
        data: userDoc,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Sync user error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
