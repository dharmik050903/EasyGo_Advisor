import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  state: { type: String, required: true },
  service: { type: String, required: true },
  preferredDate: { type: String, required: true },
  message: { type: String },
  // Required eligibility fields
  englishLevel: { type: String, required: true },
  age: { type: String, required: true },
  education: { type: String, required: true },
  experience: { type: String, required: true },
  visaType: { type: String, required: true }
}, { timestamps: true ,collection:'tblinquiry'});

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking; 