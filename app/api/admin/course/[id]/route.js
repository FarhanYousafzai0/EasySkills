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


/* ======================================
   🔥 GET SINGLE COURSE (REQUIRED BY EDIT PAGE)
======================================= */
export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolved = await params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Course ID missing" },
        { status: 400 }
      );
    }

    const course = await Course.findById(id).lean();
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Calculate section + video counts for UI
    const totalSections = course.sections?.length || 0;
    const totalVideos =
      course.sections?.reduce((sum, sec) => {
        return sum + (sec.items?.length || 0);
      }, 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        totalSections,
        totalVideos,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}


/* ======================================
   🔥 DELETE COURSE
======================================= */
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Course ID missing" },
        { status: 400 }
      );
    }

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Delete Cloudinary image if exists
    if (course.thumbnailPublicId) {
      try {
        await cloudinary.uploader.destroy(course.thumbnailPublicId);
      } catch (_) {
        // ignore cloudinary failure
      }
    }

    await Course.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
