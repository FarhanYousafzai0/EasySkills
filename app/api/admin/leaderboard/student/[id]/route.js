import Leaderboard from "@/app/models/Leaderboard";
import { connectDB } from "@/lib/mongodb";

export async function GET(_, { params }) {
  try {
    await connectDB();

    const entry = await Leaderboard.findOne({ userId: params.id });

    return Response.json({ success: true, data: entry });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}
