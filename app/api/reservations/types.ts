// app/api/reservations/types.ts
import mongoose from "mongoose";

export interface GuestInfo {
  full_name: string;
  email: string;
  address: string;
}

export interface ReservationData {
  name: string;
  maxGuests: number;
  guests: number;
  guest_info: GuestInfo[];
  submitted: boolean;
  submittedAt?: Date;
}

// Schemas
export const guestInfoSchema = new mongoose.Schema({
  full_name: { type: String },
  email: { type: String },
  address: { type: String },
});

export const reservationSchema = new mongoose.Schema({
  control_number: {
    type: Map,
    of: new mongoose.Schema({
      name: { type: String },
      maxGuests: { type: Number },
      guests: { type: Number, default: 1 },
      guest_info: [guestInfoSchema],
      submitted: { type: Boolean, default: false },
      submittedAt: { type: Date }
    }),
  },
});

// Model
export const Reservation = mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);

// Helper function
export async function findReservationByControlNumber(controlNumber: string) {
  return await Reservation.findOne({
    $expr: {
      $in: [
        controlNumber,
        {
          $map: {
            input: { $objectToArray: "$control_number" },
            as: "item",
            in: "$$item.k",
          },
        },
      ],
    },
  });
}