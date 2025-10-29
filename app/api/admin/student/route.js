
import AddStudent from "@/app/models/AddStudent";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";


export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, email, phone, plan, batch, joinDate, notes } = body;

    if (!name || !email || !plan || !joinDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const student = await AddStudent.create({
      name,
      email,
      phone,
      plan,
      batch,
      joinDate,
      notes,
    });

    return NextResponse.json(
      { success: true, message: "Student created successfully", data: student },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating student:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}




export async function GET() {
    try {
      await connectDB();
      const students = await AddStudent.find().sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: students });
    } catch (err) {
      console.error("Error fetching students:", err);
      return NextResponse.json(
        { success: false, message: "Error fetching students" },
        { status: 500 }
      );
    }
  }
  