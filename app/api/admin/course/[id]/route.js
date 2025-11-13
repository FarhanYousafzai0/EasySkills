import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ---------------------------------------------------
   GET SINGLE COURSE
----------------------------------------------------- */
export async function GET(req, { params }) {
  try {
    await connectDB();
    const course = await Course.findById(params.id);

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: course });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message });
  }
}

/* ---------------------------------------------------
   UPDATE COURSE (text + image upload)
----------------------------------------------------- */
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const course = await Course.findById(params.id);

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    const form = await req.formData();

    const updates = {
      title: form.get("title") || course.title,
      description: form.get("description") || course.description,
      level: form.get("level") || course.level,
      category: form.get("category") || course.category,
      price: form.get("price") || course.price,
      durationLabel: form.get("durationLabel") || course.durationLabel,
      accessTill: form.get("accessTill") || course.accessTill,
      isPublished: form.get("isPublished") === "true"
    };

    const file = form.get("thumbnail");

    if (file && file.size > 0) {
      if (course.thumbnailPublicId) {
        await cloudinary.uploader.destroy(course.thumbnailPublicId);
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "lms/courses" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      updates.thumbnailUrl = uploadResult.secure_url;
      updates.thumbnailPublicId = uploadResult.public_id;
    }

    Object.assign(course, updates);
    await course.save();

    return NextResponse.json({ success: true, data: course });
  } catch (err) {
    console.log("Course Update Error:", err);
    return NextResponse.json({ success: false, message: err.message });
  }
}

/* ---------------------------------------------------
   DELETE COURSE
----------------------------------------------------- */
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const course = await Course.findById(params.id);

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.thumbnailPublicId) {
      await cloudinary.uploader.destroy(course.thumbnailPublicId);
    }

    await Course.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
