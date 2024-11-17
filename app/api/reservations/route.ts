// app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { findReservationByControlNumber, Reservation } from "./types";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const controlNumber = url.searchParams.get("controlNumber");

    if (!controlNumber) {
      return NextResponse.json(
        { message: "Control number is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const reservation = await findReservationByControlNumber(controlNumber);

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    const controlNumberData = reservation.control_number.get(controlNumber);
    
    // Check submission status
    const isSubmitted = controlNumberData.submitted === true;

    return NextResponse.json({
      ...reservation.toObject(),
      control_number: controlNumberData,
      submitted: isSubmitted,
      submittedAt: controlNumberData.submittedAt || null
    });
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json(
      { message: "Error fetching reservation" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { control_number, guest_info } = data;

    if (!control_number || !Array.isArray(guest_info)) {
      return NextResponse.json(
        { message: "Control number and guest info are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // First, check if reservation exists and is not submitted
    const existingReservation = await Reservation.findOne({
      [`control_number.${control_number}`]: { $exists: true }
    });

    if (!existingReservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    const reservationData = existingReservation.control_number.get(control_number);

    // Strict check for submission status
    if (reservationData.submitted === true) {
      return NextResponse.json(
        {
          message: "This reservation has already been submitted",
          submittedAt: reservationData.submittedAt,
          submitted: true
        },
        { status: 400 }
      );
    }

    // Check guest limits
    const currentGuests = reservationData.guests || 0;
    const maxGuests = reservationData.maxGuests || 0;

    if (currentGuests + guest_info.length > maxGuests) {
      return NextResponse.json(
        { message: "Cannot exceed maximum number of guests" },
        { status: 400 }
      );
    }

    // Use atomic update with strict conditions
    const result = await Reservation.findOneAndUpdate(
      {
        _id: existingReservation._id,
        [`control_number.${control_number}.submitted`]: { $ne: true }, // Must not be submitted
        [`control_number.${control_number}`]: { $exists: true }  // Must exist
      },
      {
        $set: {
          [`control_number.${control_number}.submitted`]: true,
          [`control_number.${control_number}.submittedAt`]: new Date(),
          [`control_number.${control_number}.guests`]: currentGuests + guest_info.length,
          [`control_number.${control_number}.guest_info`]: [
            ...(reservationData.guest_info || []),
            ...guest_info
          ]
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    // Double-check if update was successful
    if (!result) {
      return NextResponse.json(
        { 
          message: "Unable to submit reservation - it may have already been submitted",
          submitted: true
        },
        { status: 400 }
      );
    }

    const updatedData = result.control_number.get(control_number);

    // Final verification
    if (!updatedData || !updatedData.submitted) {
      return NextResponse.json(
        { message: "Reservation submission failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Guests added successfully",
      reservation: updatedData,
      submitted: true
    });

  } catch (error) {
    console.error("Error processing reservation:", error);
    return NextResponse.json(
      { message: "Error processing reservation" },
      { status: 500 }
    );
  }
}