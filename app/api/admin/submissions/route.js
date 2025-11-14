import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TaskSubmission from "@/app/models/TaskSubmission";
import Student from "@/app/models/AddStudent";
import Leaderboard from "@/app/models/Leaderboard";
import { clerkClient } from "@clerk/nextjs/server";

// ======================================================
// 📌 GET — Fetch All Submissions (Admin)
// ======================================================
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const batch = searchParams.get("batch");

    const query = {};

    if (batch && batch !== "All") {
      const batchStudents = await Student.find({ batch }).select("_id");
      query.studentId = { $in: batchStudents.map((s) => s._id) };
    }

    const subs = await TaskSubmission.find(query)
      .populate("studentId", "name email batch clerkId")
      .sort({ createdAt: -1 });

    console.log("📌 Submissions fetched:", subs.length);

    return NextResponse.json({ success: true, data: subs });
  } catch (err) {
    console.error("❌ Admin GET error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ======================================================
// ✏️ PATCH — Add Feedback + Grade + Update Leaderboard
// ======================================================
export async function PATCH(req) {
  try {
    await connectDB();

    const { submissionId, feedbackMessage, score, status } = await req.json();
    console.log("📥 PATCH Received:", { submissionId, score, status });

    if (!submissionId) {
      console.log("❌ Missing submissionId");
      return NextResponse.json(
        { success: false, message: "Missing submissionId" },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // 1️⃣ Update Submission
    // ---------------------------------------------
    const update = {};
    if (typeof score === "number") update.score = score;
    if (status) update.status = status.toLowerCase();

    if (feedbackMessage?.trim()) {
      update.$push = {
        feedback: {
          message: feedbackMessage.trim(),
          fromAdmin: true,
          createdAt: new Date(),
        },
      };
    }

    const updatedSubmission = await TaskSubmission.findByIdAndUpdate(
      submissionId,
      update,
      { new: true }
    );

    if (!updatedSubmission) {
      console.log("❌ Submission not found");
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    console.log("📌 Submission updated:", updatedSubmission._id);

    // ---------------------------------------------
    // 2️⃣ Fetch Student (MongoDB)
    // ---------------------------------------------
    const student = await Student.findById(updatedSubmission.studentId);

    if (!student) {
      console.log("❌ Student not found in MongoDB");
      return NextResponse.json(
        { success: false, message: "Student record not found" },
        { status: 404 }
      );
    }

    const clerkId = student.clerkId;
    const batch = student.batch;

    console.log("👤 Student for leaderboard:", student.name, "| ClerkID:", clerkId);

    // If no score → only feedback updated
    if (typeof score !== "number") {
      console.log("ℹ️ Score not provided → only feedback updated");
      return NextResponse.json({
        success: true,
        message: "Feedback updated (no score change)",
        data: updatedSubmission,
      });
    }

    // ---------------------------------------------
    // 3️⃣ Fetch Clerk User (Correct SDK)
    // ---------------------------------------------
    let clerkUser = null;
    try {
      clerkUser = await clerkClient.getUser(clerkId);
      console.log("📌 Clerk user fetched:", clerkUser?.id);
    } catch (e) {
      console.log("⚠️ Clerk fetch failed → fallback to DB name");
    }

    const clerkFullName =
      `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim();

    const finalName = clerkFullName || student.name || "Unknown Student";

    // ---------------------------------------------
    // 4️⃣ Update Leaderboard
    // ---------------------------------------------
    let entry = await Leaderboard.findOne({ userId: clerkId });

    if (!entry) {
      console.log("🏆 Creating new leaderboard entry:", finalName);

      entry = await Leaderboard.create({
        userId: clerkId,
        name: finalName,
        batch,
        points: score,
        tasksCompleted: 1,
      });
    } else {
      console.log("🏆 Updating leaderboard entry:", finalName);

      entry.name = finalName; // update name if changed
      entry.points += score;
      entry.tasksCompleted += 1;
      entry.lastUpdated = new Date();
      await entry.save();
    }

    console.log("🏅 Leaderboard updated:", entry);

    // ---------------------------------------------
    // 5️⃣ Clerk Metadata Sync (Correct SDK)
    // ---------------------------------------------
    try {
      console.log("🔄 Updating Clerk metadata…");

      await clerkClient.updateUserMetadata(clerkId, {
        publicMetadata: {
          leaderboardPoints: entry.points,
          tasksCompleted: entry.tasksCompleted,
        },
      });

      console.log("✅ Clerk metadata synced");
    } catch (err) {
      console.log("⚠️ Clerk metadata update failed:", err.message);
    }

    return NextResponse.json({
      success: true,
      message: "Score + Feedback + Leaderboard updated",
      submission: updatedSubmission,
      leaderboard: entry,
    });
  } catch (err) {
    console.error("❌ PATCH Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
