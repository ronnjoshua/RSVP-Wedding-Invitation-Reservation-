import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ReservationModel from "@/app/models/ReservationModel";
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

// Example of how to fetch and return guest_info
export async function GET(request: NextRequest) {
    try {
      await connectToDatabase();
  
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      // Parse URL to check for filters
      const { searchParams } = new URL(request.url);
      const statusParam = searchParams.get('status');
      const searchTerm = searchParams.get('search');
      
      // Fetch all reservations
      const reservations = await ReservationModel.find().lean();
      
      // Transform the data to an array of guest records
      const guestRecords = [];
      
      for (const reservation of reservations) {
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
        
        // Extract control numbers and their data with proper typing
        const controlNumberEntries = Object.entries(typedReservation.control_number || {});
        
        for (const [controlNumber, controlData] of controlNumberEntries) {
          // Apply status filtering if requested
          if (statusParam === 'submitted' && !controlData.submitted) continue;
          if (statusParam === 'pending' && controlData.submitted) continue;
          
          // Apply search filtering if requested
          if (searchTerm && searchTerm.trim()) {
            const searchTermLower = searchTerm.toLowerCase();
            
            // Check if control number matches
            const controlNumberMatch = controlNumber.toLowerCase().includes(searchTermLower);
            
            // Check if any guest name matches
            const guestNameMatch = controlData.guest_info?.some(guest => 
              guest.full_name?.toLowerCase().includes(searchTermLower)
            );
            
            // Skip if no match
            if (!controlNumberMatch && !guestNameMatch) continue;
          }
          
          // Add this control number as a guest record
          guestRecords.push({
            _id: typedReservation._id,
            control_number: {
              [controlNumber]: {
                name: controlData.name || '',
                reservation_number: controlData.reservation_number || '',
                maxGuests: controlData.maxGuests || 10,
                guests: controlData.guests || 1,
                guest_info: controlData.guest_info || [],
                submitted: controlData.submitted || false,
                submittedAt: controlData.submittedAt || null
              }
            },
            submitted: typedReservation.submitted || false,
            expiration_number: typedReservation.expiration_number || null,
            distribution_number: typedReservation.distribution_number || null,
            createdAt: typedReservation.createdAt || new Date(),
            updatedAt: typedReservation.updatedAt || new Date()
          });
        }
      }
  
      if (guestRecords.length === 0) {
        console.debug("No guest records found in the database.");
        return NextResponse.json([], { status: 200 });
      }
  
      // Return the array directly
      return NextResponse.json(guestRecords, { status: 200 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error fetching guest records:", errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
// POST /api/guests - Create a new guest
