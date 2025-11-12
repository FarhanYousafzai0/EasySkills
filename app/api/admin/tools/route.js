import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Tool from "@/app/models/Tools";

// ✅ Add Tool
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, description, price, category, link, imageUrl } = body;

    const newTool = await Tool.create({
      name,
      description,
      price,
      category,
      link,
      imageUrl,
    });

    return NextResponse.json({ success: true, data: newTool });
  } catch (err) {
    console.error("❌ Error creating tool:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}





export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const query = category ? { category } : {};
    const tools = await Tool.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: tools });
  } catch (err) {
    console.error("❌ Error fetching tools:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}


// ✅ Update Tool
export async function PUT(req) {
  try {
    await connectDB();
    const { id, ...updates } = await req.json();
    const updated = await Tool.findByIdAndUpdate(id, updates, { new: true });

    if (!updated)
      return NextResponse.json(
        { success: false, message: "Tool not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ✅ Delete Tool
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { success: false, message: "Tool ID required" },
        { status: 400 }
      );

    await Tool.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Tool deleted" });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
