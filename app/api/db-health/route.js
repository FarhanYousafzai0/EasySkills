import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const conn = await connectDB();

    return NextResponse.json({
      ok: true,
      db: conn.connection.name,
      host: conn.connection.host
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}