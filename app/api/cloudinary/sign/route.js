import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  const { folder = "courses", resource_type = "video" } = await req.json();
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = `folder=${folder}&resource_type=${resource_type}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");

  return NextResponse.json({
    success: true,
    data: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      resource_type,
      timestamp,
      signature,
    },
  });
}
