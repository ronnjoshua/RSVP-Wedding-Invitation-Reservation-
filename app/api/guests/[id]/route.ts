import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ReservationModel from "@/app/models/ReservationModel";
import mongoose from "mongoose";
import { verify } from "jsonwebtoken";
import { ControlNumberData } from "@/app/models/GuestModel";

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

// GET /api/guests/[id] - Get a specific guest
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Validate id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid reservation ID format" }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Get control number from query params for filtering, if provided
    const { searchParams } = new URL(request.url);
    const controlParam = searchParams.get('control');

    // Find reservation
    const reservation = await ReservationModel.findById(id).lean();

    if (!reservation) {
      return NextResponse.json({ message: "Reservation not found" }, { status: 404 });
    }

    // Type the reservation control_number properly
    type ReservationWithControl = {
      _id: string;
      control_number: { [key: string]: ControlNumberData };
      submitted?: boolean;
      expiration_number?: Date;
      distribution_number?: Date;
      createdAt?: Date;
      updatedAt?: Date;
    };
    
    // Cast reservation to the typed interface
    const typedReservation = reservation as unknown as ReservationWithControl;

    // If a specific control number is requested, return only that one
    if (controlParam && typedReservation.control_number && typedReservation.control_number[controlParam]) {
      return NextResponse.json({
        _id: typedReservation._id,
        control_number: {
          [controlParam]: typedReservation.control_number[controlParam]
        },
        submitted: typedReservation.submitted,
        expiration_number: typedReservation.expiration_number,
        distribution_number: typedReservation.distribution_number,
        createdAt: typedReservation.createdAt,
        updatedAt: typedReservation.updatedAt
      });
    }

    // Otherwise return the full reservation
    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json({
      message: "Error fetching reservation",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// PUT /api/guests/[id] - Update a reservation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params.id;
    
    // Validate id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid reservation ID format" },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Update reservation
    const updatedReservation = await ReservationModel.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedReservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { 
        message: "Error updating reservation",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/guests/[id] - Delete a reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params.id;
    
    // Validate id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid reservation ID format" },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Delete reservation
    const result = await ReservationModel.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json(
      { 
        message: "Error deleting reservation",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}