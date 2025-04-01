import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "adminpassword";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = sign(
      {
        username,
        role: "admin",
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8 hours expiration
      },
      JWT_SECRET
    );

    // ✅ Include token in JSON response
    return NextResponse.json({ success: true, token }, { status: 200 });

  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
