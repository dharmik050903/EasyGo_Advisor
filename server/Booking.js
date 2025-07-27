import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  preferredDate: { type: String, required: true },
  message: { type: String }
}, { timestamps: true ,collection:'tblinquiry'});

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking; 