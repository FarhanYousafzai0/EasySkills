import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 12)));

    const filter = {};
    if (q) filter.title = { $regex: q, $options: "i" };
    if (category) filter.category = category;

    const [items, total] = await Promise.all([
      Course.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("title description thumbnailUrl category price durationLabel isPublished createdAt"),
      Course.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, data: items, total, page, limit });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      title,
      description = "",
      thumbnailUrl = "",
      thumbnailPublicId = "",
      category = "General",
      level = "Beginner",
      price = 0,
      durationLabel = "",
      accessTill = null,
      isPublished = false,
    } = body;

    if (!title) return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });

    const doc = await Course.create({
      title,
      description,
      thumbnailUrl,
      thumbnailPublicId,
      category,
      level,
      price,
      durationLabel,
      accessTill,
      isPublished,
      sections: [],
    });

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
