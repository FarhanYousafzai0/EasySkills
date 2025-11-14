import Leaderboard from "@/app/models/Leaderboard";
import Student from "@/app/models/AddStudent";    
import { connectDB } from "@/lib/mongodb";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const clerkId = params.id;

    // find student entry
    const entry = await Leaderboard.findOne({ userId: clerkId });

    if (!entry) {
      return Response.json({ success: false, message: "Student not found" });
    }

    // full leaderboard sorted
    const full = await Leaderboard.find().sort({ points: -1 });

    // calculate rank
    const rank = full.findIndex((e) => e.userId === clerkId) + 1;

    // batch leaderboard
    const batchList = full.filter((e) => e.batch === entry.batch);
    const batchRank = batchList.findIndex((e) => e.userId === clerkId) + 1;

    return Response.json({
      success: true,
      data: {
        ...entry.toObject(),
        rank,
        batchRank,
      },
    });

  } catch (error) {
    console.error("Student Rank Error:", error);
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}
