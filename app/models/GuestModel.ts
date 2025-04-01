import mongoose from 'mongoose';

// Define the schema for guest information
const guestInfoSchema = new mongoose.Schema({
  full_name: { 
    type: String, 
    required: [true, 'Full name is required'] 
  },
  age: { 
    type: Number, 
    required: [true, 'Age is required'],
    min: [7, 'Age must be greater than 7']
  },
  email: { 
    type: String, 
    required: false,
    match: [/.+\@.+\..+/, 'Please provide a valid email address'] 
  },
  address: { 
    type: String, 
    required: false  // Made optional based on your data
  }
});

// Define the guest model schema
const guestSchema = new mongoose.Schema({
  control_number: {
    type: Map,
    of: new mongoose.Schema({
      name: {
        type: String,
        required: false
      },
      reservation_number: { 
        type: String, 
        required: true 
      },
      maxGuests: { 
        type: Number, 
        required: true,
        min: [1, 'Must allow at least 1 guest'],
        max: [10, 'Cannot exceed 10 guests']
      },
      guests: { 
        type: Number, 
        default: 1,
        min: [1, 'Must have at least 1 guest']
      },
      guest_info: { 
        type: [guestInfoSchema],
        validate: [arrayLimit, 'At least one guest is required']
      },
      submitted: {
        type: Boolean,
        default: false
      },
      submittedAt: {
        type: Date,
        required: false
      }
    })
  },
  submitted: {
    type: Boolean,
    default: false
  },
  expiration_number: {
    type: Date,
    required: false
  },
  distribution_number: {
    type: Date,
    required: false
  }
}, {
  timestamps: true,
  strict: true // Enforce schema structure
});

// Helper function to validate array length
function arrayLimit(val: any[]) {
  return val.length > 0;
}

// TypeScript interfaces
export interface GuestInfo {
  full_name: string;
  age: number;
  email?: string;
  address?: string;
}

export interface ControlNumberData {
  name?: string;
  reservation_number: string;
  maxGuests: number;
  guests: number;
  guest_info: GuestInfo[];
  submitted?: boolean;
  submittedAt?: Date;
}

export interface Guest {
  _id?: string;
  control_number: {
    [key: string]: ControlNumberData;
  };
  submitted?: boolean;
  expiration_number?: Date;
  distribution_number?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}