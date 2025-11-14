import Leaderboard from "@/app/models/Leaderboard";
import Student from "@/app/models/AddStudent";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    // fetch leaderboard entries
    const list = await Leaderboard.find().sort({ points: -1 });

    // attach student names
    const withNames = await Promise.all(
      list.map(async (entry) => {
        const student = await Student.findOne({ clerkId: entry.userId }).select("name");

        return {
          ...entry.toObject(),
          name: student?.name || "Unknown",
        };
      })
    );

    return Response.json({
      success: true,
      data: withNames,
    });

  } catch (error) {
    console.error("Leaderboard Fetch Error:", error);
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}
