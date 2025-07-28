// Minimal Express server for handling consultation bookings and sending emails
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
// import Booking from './Booking.js';
import { findOneBooking, findManyBookings, insertBooking, deleteBooking } from './bookingService.js';
import CryptoJS from "crypto-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "EasyGoAdvisor@1974"; // Use the same key as frontend

// Set up CORS to only allow requests from the frontend origin
const allowedOrigins = [
  'http://localhost:3000', // React dev server
  // Add your production domain here, e.g. 'https://yourdomain.com'
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Helper: Validate time format (HH:MM, 24-hour)
function isValidTime(time) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

// POST endpoint to handle booking
app.post('/api/book-consultation', async (req, res) => {
  let formData;
  try {
    if (req.body.encrypted) {
      // Decrypt if encrypted (production)
      const bytes = CryptoJS.AES.decrypt(req.body.encrypted, SECRET_KEY);
      formData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } else {
      // Use plain data if not encrypted (development)
      formData = req.body;
    }
  } catch (err) {
    return res.status(400).json({ error: 'Invalid data.' });
  }
  
  const { name, email, phone, service, preferredDate, message } = formData;

  // Validate required fields
  if (!name || !email || !phone || !service || !preferredDate) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Validate date - allow today and future dates
  const now = new Date();
  const bookingDate = new Date(preferredDate);
  if (isNaN(bookingDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format.' });
  }
  now.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);
  if (bookingDate < now) {
    return res.status(400).json({ error: 'Cannot book a consultation in the past.' });
  }

  // Check for conflicts: same email on the same date
  const conflict = await findOneBooking({ preferredDate, email: email.toLowerCase() });
  if (conflict) {
    return res.status(409).json({ error: 'You have already booked a consultation for this date with this email.' });
  }

  // Store booking in DB
  await insertBooking({ name, email: email.toLowerCase(), phone, service, preferredDate, message });

  // Create Nodemailer transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Email to user (confirmation)
  const userMailOptions = {
    from: `Easy Go Overseas <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Consultation Booking - Easy Go Overseas',
    text: `Dear ${name},\n\nThank you for booking a consultation with Easy Go Overseas.\n\nDetails:\nService: ${service}\nDate: ${preferredDate}\n\nWe will contact you soon!\n\nBest regards,\nEasy Go Overseas Team`,
  };

  // Email to admin (notification)
  const adminMailOptions = {
    from: `Easy Go Overseas <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: 'New Consultation Booking',
    text: `A new consultation has been booked:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nDate: ${preferredDate}\nMessage: ${message || 'N/A'}`,
  };

  try {
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send emails.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 