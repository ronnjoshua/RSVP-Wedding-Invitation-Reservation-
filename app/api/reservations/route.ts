import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Reservation } from "./types";

interface ReservationDocument {
  _id: string;
  control_number: {
    [key: string]: {
      name: string;
      maxGuests: number;
      guests: number;
      guest_info: Array<{
        full_name: string;
        email: string;
        address: string;
      }>;
      submitted: boolean;
      submittedAt?: Date;
    };
  };
}

export async function GET(request: NextRequest) {
  let connection;
  try {
    const url = new URL(request.url);
    const controlNumber = url.searchParams.get("controlNumber");
    
    console.log('Received control number:', controlNumber);

    if (!controlNumber) {
      return NextResponse.json(
        { message: "Control number is required" },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    connection = await connectToDatabase();
    
    if (!connection.readyState) {
      throw new Error('Database connection failed');
    }
    console.log('Database connected successfully');

    // Get the reservation and cast it to the correct type
    const reservation = await Reservation.findOne({
      [`control_number.${controlNumber}`]: { $exists: true }
    }).lean() as ReservationDocument | null;

    console.log('Raw reservation data:', reservation);

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    // Access the control number data using the type-safe approach
    const controlNumberData = reservation.control_number[controlNumber];
    console.log('Control number data:', controlNumberData);

    if (!controlNumberData) {
      return NextResponse.json(
        { message: "Control number data not found" },
        { status: 404 }
      );
    }

    const responseData = {
      control_number: controlNumberData,
      submitted: controlNumberData.submitted || false,
      submittedAt: controlNumberData.submittedAt || null
    };

    console.log('Sending response:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error in reservation fetch:", error);
    
    if (!connection?.readyState) {
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Error fetching reservation",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}