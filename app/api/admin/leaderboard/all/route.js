import Leaderboard from "@/app/models/Leaderboard";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();


    const leaderboard = await Leaderboard.find()
      .sort({ points: -1 }) // Highest points first
      .limit(200); // Safety limit (you can increase if needed)

    return Response.json({
      success: true,
      data: leaderboard,
    });

  } catch (error) {
    console.error("Leaderboard Fetch Error:", error);
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}
