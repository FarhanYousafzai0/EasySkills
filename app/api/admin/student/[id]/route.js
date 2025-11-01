import { NextResponse } from "next/server";
import AddStudent from "@/app/models/AddStudent";
import { connectDB } from "@/lib/mongodb";

export async function PUT(req, context) {
  try {
    await connectDB();
    const { id } = context.params; 
    const body = await req.json();

    const updated = await AddStudent.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating student:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();
    const { id } = context.params;

    // 1️⃣ Find student first (so we can get Clerk ID)
    const student = await AddStudent.findById(id);
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Try deleting from Clerk if clerkId exists
    if (student.clerkId) {
      try {
        const res = await fetch(`https://api.clerk.dev/v1/users/${student.clerkId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.warn(`⚠️ Clerk deletion failed for ${student.email}`);
        }
      } catch (err) {
        console.error("⚠️ Error contacting Clerk API:", err);
      }
    }

    // 3️⃣ Delete from MongoDB
    await AddStudent.findByIdAndDelete(id);

    // 4️⃣ Return response
    return NextResponse.json({
      success: true,
      message: `Student deleted from system${
        student.clerkId ? " and Clerk" : ""
      } successfully.`,
    });
  } catch (err) {
    console.error("Error deleting student:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
