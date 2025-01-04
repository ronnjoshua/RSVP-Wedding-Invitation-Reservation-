import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Reservation } from "../types";

// Add this GET handler
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

    // Connect to database
    connection = await connectToDatabase();
    
    if (!connection.readyState) {
      throw new Error('Database connection failed');
    }

    // Find the reservation
    const reservation = await Reservation.findOne({
      [`control_number.${controlNumber}`]: { $exists: true }
    }).lean();

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { controlNumber: string } }
) {
  let connection;
  try {
    const controlNumber = params.controlNumber;
    const data = await request.json();
    console.log("1. Received control number:", controlNumber);
    console.log("2. Received data:", data);

    if (!controlNumber) {
      return NextResponse.json(
        { message: "Control number is required" },
        { status: 400 }
      );
    }

    // Connect to database
    connection = await connectToDatabase();
    
    if (!connection.readyState) {
      throw new Error('Database connection failed');
    }

    // Find the current reservation and log the raw result
    const currentReservation = await Reservation.findOne({
      [`control_number.${controlNumber}`]: { $exists: true }
    }).lean(); // Use lean() to get plain JavaScript object

    console.log("3. Full reservation document:", JSON.stringify(currentReservation, null, 2));

    if (!currentReservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    // Log the control_number object
    console.log("4. Control number object:", currentReservation.control_number);

    // Check if the specific control number exists
    if (!currentReservation.control_number || !currentReservation.control_number[controlNumber]) {
      return NextResponse.json(
        { message: `Reservation with control number ${controlNumber} not found` },
        { status: 404 }
      );
    }

    const currentData = currentReservation.control_number[controlNumber];
    console.log("5. Current data for this control number:", currentData);

    // Check if already submitted
    if (currentData.submitted) {
      return NextResponse.json(
        { message: "This reservation has already been submitted" },
        { status: 400 }
      );
    }

    // Update the guest information
    if (Array.isArray(data.guest_info)) {
      // Validate guest count
      if (data.guest_info.length > currentData.maxGuests) {
        return NextResponse.json(
          { 
            message: `Cannot exceed the maximum number of guests (${currentData.maxGuests})` 
          },
          { status: 400 }
        );
      }

      // Log the update operation we're about to perform
      console.log("6. Attempting to update with:", {
        query: { [`control_number.${controlNumber}`]: { $exists: true } },
        update: {
          [`control_number.${controlNumber}.guest_info`]: data.guest_info,
          [`control_number.${controlNumber}.guests`]: data.guest_info.length,
          [`control_number.${controlNumber}.submitted`]: true,
          [`control_number.${controlNumber}.submittedAt`]: new Date()
        }
      });

      // Update using updateOne
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

      console.log("7. Update result:", updateResult);

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json(
          { message: "Failed to update reservation" },
          { status: 500 }
        );
      }

      // Fetch and log the updated document
      const updatedReservation = await Reservation.findOne({
        [`control_number.${controlNumber}`]: { $exists: true }
      }).lean();

      console.log("8. Updated reservation:", JSON.stringify(updatedReservation, null, 2));

      return NextResponse.json({
        message: "Reservation updated successfully",
        data: {
          control_number: updatedReservation.control_number[controlNumber],
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
    console.error("Detailed error:", error);
    
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