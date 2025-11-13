import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/app/models/Course";

/* ---------------------------------------------------
   CREATE SECTION  (POST)
----------------------------------------------------- */
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { title } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Section title required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    course.sections.push({ title: title.trim(), items: [] });
    await course.save();

    return NextResponse.json({
      success: true,
      sections: course.sections,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

/* ---------------------------------------------------
   UPDATE SECTION TITLE  (PUT)
----------------------------------------------------- */
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { sectionId, title } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Section title cannot be empty" },
        { status: 400 }
      );
    }

    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    const section = course.sections.id(sectionId);
    if (!section) {
      return NextResponse.json(
        { success: false, message: "Section not found" },
        { status: 404 }
      );
    }

    section.title = title.trim();
    await course.save();

    return NextResponse.json({
      success: true,
      sections: course.sections,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

/* ---------------------------------------------------
   DELETE SECTION  (DELETE)
----------------------------------------------------- */
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const sectionId = req.nextUrl.searchParams.get("sectionId");
    if (!sectionId) {
      return NextResponse.json(
        { success: false, message: "sectionId required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    const section = course.sections.id(sectionId);
    if (!section) {
      return NextResponse.json(
        { success: false, message: "Section not found" },
        { status: 404 }
      );
    }

    section.deleteOne();
    await course.save();

    return NextResponse.json({
      success: true,
      sections: course.sections,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
