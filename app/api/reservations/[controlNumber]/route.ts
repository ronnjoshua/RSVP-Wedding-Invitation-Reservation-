import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Reservation, ReservationDocument } from "../types";

export async function GET(
  request: NextRequest,
  { params }: { params: { controlNumber: string } }
) {
  let connection;
  try {
    const controlNumber = params.controlNumber;

    if (!controlNumber) {
      return NextResponse.json(
        { message: "Control number is required" },
        { status: 400 }
      );
    }

    connection = await connectToDatabase();
    
    if (!connection.readyState) {
      throw new Error('Database connection failed');
    }

    const reservation = await Reservation.findOne({
      [`control_number.${controlNumber}`]: { $exists: true }
    }).lean() as (ReservationDocument & { _id: any });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      control_number: {
        [controlNumber]: reservation.control_number[controlNumber]
      }
    });

  } catch (error) {
    console.error("Error fetching reservation:", error);
    
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