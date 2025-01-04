// app/api/reservations/[controlNumber]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Reservation } from "../types";
import mongoose from "mongoose";

// Define the type for the lean document
interface LeanReservation {
  _id: mongoose.Types.ObjectId;
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
    }).lean() as LeanReservation;

    if (!reservation || !reservation.control_number) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    const reservationData = reservation.control_number[controlNumber];
    
    if (!reservationData) {
      return NextResponse.json(
        { message: "Reservation data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      control_number: {
        [controlNumber]: reservationData
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { controlNumber: string } }
) {
  let connection;
  try {
    const controlNumber = params.controlNumber;
    const data = await request.json();

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

    const currentReservation = await Reservation.findOne({
      [`control_number.${controlNumber}`]: { $exists: true }
    }).lean() as LeanReservation;

    if (!currentReservation || !currentReservation.control_number) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    const currentData = currentReservation.control_number[controlNumber];

    if (!currentData) {
      return NextResponse.json(
        { message: `Reservation with control number ${controlNumber} not found` },
        { status: 404 }
      );
    }

    if (currentData.submitted) {
      return NextResponse.json(
        { message: "This reservation has already been submitted" },
        { status: 400 }
      );
    }

    if (Array.isArray(data.guest_info)) {
      if (data.guest_info.length > currentData.maxGuests) {
        return NextResponse.json(
          { 
            message: `Cannot exceed the maximum number of guests (${currentData.maxGuests})` 
          },
          { status: 400 }
        );
      }

      const updateResult = await Reservation.updateOne(
        { [`control_number.${controlNumber}`]: { $exists: true } },
        {
          $set: {
            [`control_number.${controlNumber}.guest_info`]: data.guest_info,
            [`control_number.${controlNumber}.guests`]: data.guest_info.length,
            [`control_number.${controlNumber}.submitted`]: true,
            [`control_number.${controlNumber}.submittedAt`]: new Date()
          }
        }
      );

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json(
          { message: "Failed to update reservation" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Reservation updated successfully",
        data: {
          control_number: controlNumber,
          submitted: true,
          submittedAt: new Date()
        }
      });
    }

    return NextResponse.json(
      { message: "No guest information provided" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error updating reservation:", error);
    
    if (!connection?.readyState) {
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Error updating reservation",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}