import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// ========================
// 🔥 GET ALL COURSES
// ========================
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
        .lean(),
      Course.countDocuments(filter),
    ]);

    // 🔥 Add Section Count + Video Count
    const coursesWithCounts = items.map((course) => {
      const totalSections = course.sections?.length || 0;

      const totalVideos =
        course.sections?.reduce((sum, sec) => {
          return sum + (sec.items?.length || 0);
        }, 0) || 0;

      return {
        ...course,
        totalSections,
        totalVideos,
      };
    });

    return NextResponse.json({
      success: true,
      data: coursesWithCounts,
      total,
      page,
      limit,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}


// ========================
// 🔥 CREATE COURSE
// ========================
export async function POST(req) {
  try {
    await connectDB();

    const form = await req.formData();

    const title = form.get("title");
    const description = form.get("description") || "";
    const level = form.get("level") || "";
    const category = form.get("category") || "";
    const accessTill = form.get("accessTill") || null;
    const price = Number(form.get("price") || 0);
    const durationLabel = form.get("durationLabel") || "";
    const isPublished = form.get("isPublished") === "true";

    const file = form.get("thumbnail");

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

    // 🔥 Upload Thumbnail (if provided)
    let thumbnailUrl = "";
    let thumbnailPublicId = "";

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "lms/courses" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      thumbnailUrl = uploaded.secure_url;
      thumbnailPublicId = uploaded.public_id;
    }

    // 🔥 Create Course
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
    console.log("ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
