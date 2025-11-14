
import Leaderboard from "@/app/models/Leaderboard";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    const list = await Leaderboard.find().sort({ points: -1 }).limit(100);

    return Response.json({ success: true, data: list });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}
