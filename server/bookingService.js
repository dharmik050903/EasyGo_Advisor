import Booking from './Booking.js';

export async function findOneBooking(query) {
  return await Booking.findOne(query);
}

export async function findManyBookings(query) {
  return await Booking.find(query);
}

export async function insertBooking(data) {
  const booking = new Booking(data);
  return await booking.save();
}

export async function deleteBooking(query) {
  return await Booking.deleteOne(query);
} 