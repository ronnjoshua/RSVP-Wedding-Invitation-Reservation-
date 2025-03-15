// route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Reservation, ReservationType } from "../types";
import { Resend } from 'resend';


export interface GuestInfo {
  full_name: string;
  age: number;
  email?: string;
  address?: string;
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
    }).lean().exec() as ReservationType;

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

  const resend = new Resend(process.env.RESEND_API_KEY);
  
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
    }).lean().exec() as ReservationType;

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

      // After successful database update, send confirmation emails
      try {
        // Format all guests data for email use
        const allGuestsFormatted = data.guest_info.map((guest: { full_name: any; age: any; email: any; address: any; }, index: number) => ({
          number: index + 1,
          fullName: guest.full_name,
          age: guest.age,
          email: guest.email || 'Not provided',
          address: guest.address || 'Not provided'
        }));

        // Create guest list HTML table
        const guestListHTML = allGuestsFormatted.map((guest: { number: any; fullName: any; age: any; email: any; address: any; }) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${guest.number}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${guest.fullName}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${guest.age}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${guest.email}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${guest.address}</td>
          </tr>
        `).join('');

        // Create the HTML email content
        const emailHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0A5741; text-align: center;">Reservation Confirmation</h1>
            
            <div style="background-color: #f7f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h3>Reservation Details</h3>
              <p><strong>Reservation Number:</strong> ${currentData.reservation_number}</p>
              <p><strong>Total Guests:</strong> ${data.guest_info.length}</p>
              <p><strong>Date Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <h3>Guest Information:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Guest #</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Name</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Age</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Email</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Address</th>
              </tr>
              ${guestListHTML}
            </table>
            
            <p>Thank you for your reservation. If you need to make any changes, please contact us.</p>
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
              <p>© 2025 Your Event Name. All rights reserved.</p>
            </div>
          </div>
        `;

        // Get your verified email from environment variables
        const verifiedEmail = process.env.VERIFIED_EMAIL || 'ronnnucup1@gmail.com';

        // 1. Send admin notification to your verified email
        await resend.emails.send({
          from: 'Resend <onboarding@resend.dev>',
          to: verifiedEmail,
          subject: `Admin Notification: New Reservation ${currentData.reservation_number}`,
          html: `
            <div style="padding: 20px; background-color: #f0f8ff; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #0A5741;">Admin Notification</h2>
              <p>A new reservation has been submitted.</p>
            </div>
            ${emailHTML}
          `
        });

        // 2. For each guest with an email, send a forwarded version to your verified email
        for (const guest of data.guest_info.filter((g: { email: string; }) => g.email && g.email.trim() !== '')) {
          // Create personalized message showing the intended recipient
          const personalizedHTML = `
            <div style="padding: 20px; background-color: #fff8e1; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #ff6d00;">Forwarded Guest Confirmation</h2>
              <p><strong>Forwarded To:</strong> ${guest.email}</p>
              <p><strong>Guest name:</strong> ${guest.full_name}</p>
            </div>
            ${emailHTML}
          `;
          
          // Send to your verified email
          await resend.emails.send({
            from: 'Resend <onboarding@resend.dev>',
            to: verifiedEmail,
            subject: `Guest Confirmation for ${guest.full_name} (${currentData.reservation_number})`,
            html: personalizedHTML
          });
        }
        
        console.log("Email notifications sent successfully");
      } catch (emailError) {
        console.error("Error sending confirmation emails:", emailError);
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