import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import ReservationModel from "../../../models/ReservationModel";
import { headers } from "next/headers";
import { verify } from "jsonwebtoken";

// Make sure this matches the JWT_SECRET in your login route
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    // ✅ 1. Connect to MongoDB
    await connectToDatabase();
    console.log("✅ Database connected successfully.");

    // ✅ 2. Get and verify the JWT token from Authorization header
    const headersList = headers();
    const authHeader = headersList.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("❌ Unauthorized access attempt: No or invalid Authorization header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Verify the JWT token
      verify(token, JWT_SECRET);
      console.log("✅ JWT token verified successfully");
    } catch (verifyError) {
      console.warn("❌ Invalid or expired token:", verifyError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ 3. Fetch reservations
    const reservations = await ReservationModel.find().lean();

    if (!reservations.length) {
      console.warn("⚠️ No reservations found.");
      return NextResponse.json({ message: "No reservations found" }, { status: 404 });
    }

    console.log("✅ Reservations fetched:", reservations.length);
    return NextResponse.json(reservations);
    
  } catch (error) {
    console.error("❌ Error fetching reservations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}