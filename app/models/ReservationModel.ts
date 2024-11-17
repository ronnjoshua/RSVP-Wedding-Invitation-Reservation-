import mongoose from 'mongoose';

const guestInfoSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, match: /.+\@.+\..+/ },
  address: { type: String, required: true },
  // Add other fields if needed
});

const reservationSchema = new mongoose.Schema({
  control_number: {
    type: Map,
    of: new mongoose.Schema({
      name: { type: String, required: true },
      maxGuests: { type: Number, required: true },
      guests: { type: Number, default: 1 },
      guest_info: { 
        type: [guestInfoSchema],
        validate: [arrayLimit, 'The guest_info array is empty']
      },
    }),
  },
});

// Helper function to validate array length
function arrayLimit(val: any[]) {
  return val.length > 0;
}

const ReservationModel = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);

export default ReservationModel;
