import Leaderboard from "@/app/models/Leaderboard";
import { connectDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectDB();
    const { userId } = await req.json();

    const all = await Leaderboard.find().sort({ points: -1 });

    const index = all.findIndex((u) => u.userId === userId);

    return Response.json({
      success: true,
      rank: index + 1,
      total: all.length,
      data: all[index],
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}
