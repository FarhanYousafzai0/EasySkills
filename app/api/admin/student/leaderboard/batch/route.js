import Leaderboard from "@/app/models/Leaderboard";
import Student from "@/app/models/AddStudent";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    const { userId } = auth();
    const student = await Student.findOne({ clerkId: userId });

    if (!student) {
      return Response.json({ success: false, message: "Student not found" });
    }

    const batchStudents = await Leaderboard.find({ batch: student.batch })
      .sort({ points: -1 });

    const withNames = await Promise.all(
      batchStudents.map(async (entry) => {
        const s = await Student.findOne({ clerkId: entry.userId }).select("name batch");
        return {
          ...entry.toObject(),
          name: s?.name || "Unknown",
        };
      })
    );

    return Response.json({
      success: true,
      batch: student.batch,
      data: withNames,
    });

  } catch (err) {
    console.error("Batch Leaderboard Error:", err);
    return Response.json({ success: false, message: err.message });
  }
}
