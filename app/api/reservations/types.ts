// types.ts
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

export interface ReservationType {
  _id: mongoose.Types.ObjectId;
  control_number: {
    [key: string]: ReservationData;
  };
}

const guestInfoSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
});

const reservationSchema = new mongoose.Schema({
  control_number: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    _id: false,
    default: {},
  }
}, {
  timestamps: true,
  strict: false // Allow dynamic fields
});

export const Reservation = (mongoose.models.Reservation as mongoose.Model<ReservationType>) || 
  mongoose.model<ReservationType>("Reservation", reservationSchema);