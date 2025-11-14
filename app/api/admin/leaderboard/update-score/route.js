import Leaderboard from "@/app/models/Leaderboard";
import Student from "@/app/models/AddStudent";
import { clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectDB();

    const { userId, batch, score } = await req.json();

    if (!userId || score == null)
      return Response.json({ success: false, message: "Invalid data" });

    // get student name
    const student = await Student.findOne({ clerkId: userId }).select("name");
    const name = student?.name || "Unknown";

    let entry = await Leaderboard.findOne({ userId });

    if (!entry) {
      entry = await Leaderboard.create({
        userId,
        name,
        batch,
        points: score,
        tasksCompleted: 1,
      });
    } else {
      entry.points += score;
      entry.tasksCompleted += 1;
      entry.lastUpdated = new Date();
      await entry.save();
    }

    // update Clerk metadata
    try {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          leaderboardPoints: entry.points,
          tasksCompleted: entry.tasksCompleted,
        },
      });
    } catch (e) {
      console.log("⚠ Clerk metadata error:", e);
    }

    return Response.json({ success: true, data: entry });

  } catch (error) {
    console.log(error);
    return Response.json({ success: false, error: error.message });
  }
}
