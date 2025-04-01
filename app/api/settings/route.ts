import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SettingsModel, { Settings } from "@/app/models/SettingsModel";
import { verify } from "jsonwebtoken";

// Middleware to verify JWT token
const verifyToken = (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key");
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

// GET /api/settings - Get current settings
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find settings (assuming only one settings document)
    const settings = await SettingsModel.findOne().lean();
    
    if (!settings) {
      return NextResponse.json(
        { message: "Settings not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { 
        message: "Error fetching settings",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// POST /api/settings - Create initial settings
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if settings already exist
    await connectToDatabase();
    const existingSettings = await SettingsModel.findOne();
    
    if (existingSettings) {
      return NextResponse.json(
        { message: "Settings already exist. Use PUT to update." },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Handle date fields properly
    const settingsData: Settings = {
      ...body,
      eventDate: new Date(body.eventDate),
      rsvpDeadline: new Date(body.rsvpDeadline)
    };
    
    // Create new settings
    const settings = new SettingsModel(settingsData);
    await settings.save();
    
    return NextResponse.json(settings, { status: 201 });
  } catch (error) {
    console.error("Error creating settings:", error);
    return NextResponse.json(
      { 
        message: "Error creating settings",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find existing settings
    const existingSettings = await SettingsModel.findOne();
    
    if (!existingSettings) {
      return NextResponse.json(
        { message: "Settings not found. Use POST to create initial settings." },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Handle date fields if provided
    const updateData: Partial<Settings> = {
      ...body,
      updatedAt: new Date()
    };
    
    if (body.eventDate) {
      updateData.eventDate = new Date(body.eventDate);
    }
    
    if (body.rsvpDeadline) {
      updateData.rsvpDeadline = new Date(body.rsvpDeadline);
    }
    
    // Update settings
    const settings = await SettingsModel.findByIdAndUpdate(
      existingSettings._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { 
        message: "Error updating settings",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}