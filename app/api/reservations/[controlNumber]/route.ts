import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Reservation } from "../types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { controlNumber: string } }
) {
  try {
    const { controlNumber } = params;
    const data = await request.json();
    const { name, maxGuests, guest_info } = data;

    await connectToDatabase();
    const reservation = await Reservation.findOne({
      [`control_number.${controlNumber}`]: { $exists: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    const reservationData = reservation.control_number.get(controlNumber);

    // Update basic information
    if (name) reservationData.name = name;
    if (maxGuests) reservationData.maxGuests = maxGuests;

    // Handle guest information replacement
    if (Array.isArray(guest_info)) {
      // Validate against maxGuests before updating
      if (guest_info.length > reservationData.maxGuests) {
        return NextResponse.json(
          { message: "Cannot exceed the maximum number of guests" },
          { status: 400 }
        );
      }

      // Replace entire guest_info array instead of appending
      reservationData.guest_info = guest_info;
      reservationData.guests = guest_info.length;
    }

    reservation.control_number.set(controlNumber, reservationData);
    await reservation.save();

    return NextResponse.json({
      message: "Reservation updated successfully",
      reservation: reservationData,
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { message: "Error updating reservation" },
      { status: 500 }
    );
  }
}