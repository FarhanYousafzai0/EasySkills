import Course from "@/app/models/Course";
import Progress from "@/app/models/Progress";
import { Types } from "mongoose";


export async function computePercentage(clerkId, courseId) {
  const course = await Course.findById(courseId).select("sections.items._id");
  if (!course) return 0;

  const totalVideos = course.sections.reduce((acc, s) => acc + s.items.length, 0);
  if (totalVideos === 0) return 0;

  const progress = await Progress.findOne({ clerkId, courseId: new Types.ObjectId(courseId) })
    .select("completedVideos");
  const completed = progress?.completedVideos?.length || 0;

  return Math.min(100, Math.round((completed / totalVideos) * 100));
}
