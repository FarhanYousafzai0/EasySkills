import Leaderboard from "@/app/models/Leaderboard";
import { connectDB } from "@/lib/mongodb";

export async function PUT(req) {
  try {
    await connectDB();

    const body = await req.json();

    const settings = await LeaderboardSettings.findOneAndUpdate(
      {},
      body,
      { new: true, upsert: true }
    );

    return Response.json({ success: true, data: settings });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}

export async function GET() {
  try {
    await connectDB();

    const settings = await LeaderboardSettings.findOne() || {};

    return Response.json({ success: true, data: settings });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}
