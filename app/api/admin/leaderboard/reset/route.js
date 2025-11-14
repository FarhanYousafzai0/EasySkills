import Leaderboard from "@/app/models/Leaderboard";
import { connectDB } from "@/lib/mongodb";

export async function POST() {
  try {
    await connectDB();
    await Leaderboard.deleteMany({});
    return Response.json({ success: true, message: "Leaderboard reset" });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}
