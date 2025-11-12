import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Tool from "@/app/models/Tools";
import { v2 as cloudinary } from "cloudinary";

// 🔧 Cloudinary Config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 🧩 Add Tool (supports Cloudinary image upload)
export async function POST(req) {
  try {
    await connectDB();
    const formData = await req.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const category = formData.get("category");
    const link = formData.get("link");
    const image = formData.get("image");

    if (!name || !description || !price || !category)
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );

    let imageUrl = "";
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "tools" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });
      imageUrl = uploaded.secure_url;
    }

    const tool = await Tool.create({
      name,
      description,
      price,
      category,
      link,
      imageUrl,
    });

    return NextResponse.json({ success: true, data: tool });
  } catch (err) {
    console.error("❌ Error creating tool:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 🧩 Get All Tools (with optional category)
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
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 🧩 Update Tool
export async function PUT(req) {
  try {
    await connectDB();
    const { id, ...updates } = await req.json();
    const updated = await Tool.findByIdAndUpdate(id, updates, { new: true });
    if (!updated)
      return NextResponse.json({ success: false, message: "Tool not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Error updating tool:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// 🧩 Delete Tool
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
    console.error("❌ Error deleting tool:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
