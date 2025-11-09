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
const SECRET_KEY = process.env.SECRET_KEY || "EasyGoAdvisor@1974"; // Use the same key as frontend

// Validate critical environment variables
if (!process.env.SECRET_KEY) {
  console.warn("⚠️  WARNING: SECRET_KEY is not defined in environment variables. Using default value (not recommended for production).");
}

if (!process.env.MONGO_URI) {
  console.warn("⚠️  WARNING: MONGO_URI is not defined in environment variables.");
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️  WARNING: Email credentials (EMAIL_USER or EMAIL_PASS) are not defined. Email functionality may not work.");
}
// Set up CORS to only allow requests from the frontend origin
const allowedOrigins = [
  'http://localhost:3000', 
  'https://easy-go-advisor.vercel.app'
  // React dev server
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
  
  // Step 1: Decrypt/parse request data
  try {
    if (req.body.encrypted) {
      if (!SECRET_KEY) {
        return res.status(500).json({ error: 'Server configuration error: encryption key missing.' });
      }
      // Decrypt if encrypted (production)
      const bytes = CryptoJS.AES.decrypt(req.body.encrypted, SECRET_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedString) {
        return res.status(400).json({ error: 'Invalid encrypted data. Decryption failed.' });
      }
      formData = JSON.parse(decryptedString);
    } else {
      // Use plain data if not encrypted (development)
      formData = req.body;
    }
  } catch (err) {
    console.error('Error parsing request data:', err);
    return res.status(400).json({ error: 'Invalid data format. Please try again.' });
  }
  
  // Step 2: Extract and validate fields
  const { name, email, phone, state, service, preferredDate, message, englishLevel, age, education, experience, visaType } = formData || {};

  // Validate required fields
  if (!name || !email || !phone || !state || !service || !preferredDate || !englishLevel || !age || !education || !experience || !visaType) {
    return res.status(400).json({ 
      error: 'Missing required fields. Please fill in all required fields.' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Invalid email format.' });
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

  // Step 3: Check for conflicts in database
  let conflict;
  try {
    conflict = await findOneBooking({ preferredDate, email: email.toLowerCase() });
  } catch (dbError) {
    console.error('Database error while checking conflicts:', dbError);
    return res.status(500).json({ 
      error: 'Database error. Please try again later or contact support.' 
    });
  }
  
  if (conflict) {
    return res.status(409).json({ 
      error: 'You have already booked a consultation for this date with this email.' 
    });
  }

  // Step 4: Store booking in database
  try {
    await insertBooking({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      phone: phone.trim(), 
      state: state.trim(),
      service, 
      preferredDate, 
      message: message ? message.trim() : '',
      // Required eligibility fields
      englishLevel: englishLevel.trim(),
      age: age.trim(),
      education: education.trim(),
      experience: experience.trim(),
      visaType: visaType.trim()
    });
  } catch (dbError) {
    console.error('Database error while inserting booking:', dbError);
    return res.status(500).json({ 
      error: 'Failed to save booking. Please try again later or contact support.' 
    });
  }

  // Step 5: Send emails (non-blocking - booking is already saved)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured. Skipping email notifications.');
    return res.json({ 
      success: true, 
      message: 'Booking saved successfully. Email notifications are disabled.' 
    });
  }

  try {
    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email to user (confirmation)
    let userEmailText = `Dear ${name},\n\nThank you for booking a consultation with Easy Go Overseas.\n\nDetails:\nService: ${service}\nDate: ${preferredDate}\nState: ${state}\n`;
    
    // Add eligibility information if provided
    if (englishLevel || age || education || experience || visaType) {
      userEmailText += `\n--- Canada Immigration Eligibility Details ---\n`;
      if (englishLevel) userEmailText += `English Level: ${englishLevel}\n`;
      if (age) userEmailText += `Age: ${age}\n`;
      if (education) userEmailText += `Education: ${education}\n`;
      if (experience) userEmailText += `Experience: ${experience}\n`;
      if (visaType) userEmailText += `Visa Type: ${visaType}\n`;
    }
    
    userEmailText += `\nWe will contact you soon!\n\nBest regards,\nEasy Go Overseas Team`;
    
    const userMailOptions = {
      from: `Easy Go Overseas <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Consultation Booking - Easy Go Overseas' + (englishLevel ? ' - With Eligibility Check' : ''),
      text: userEmailText,
    };

    // Email to admin (notification)
    let adminEmailText = `A new consultation has been booked:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nState: ${state}\nService: ${service}\nDate: ${preferredDate}\nMessage: ${message || 'N/A'}`;
    
    // Add eligibility information if provided
    if (englishLevel || age || education || experience || visaType) {
      adminEmailText += `\n\n--- Canada Immigration Eligibility Details ---\n`;
      if (englishLevel) adminEmailText += `English Level: ${englishLevel}\n`;
      if (age) adminEmailText += `Age: ${age}\n`;
      if (education) adminEmailText += `Education: ${education}\n`;
      if (experience) adminEmailText += `Experience: ${experience}\n`;
      if (visaType) adminEmailText += `Visa Type: ${visaType}\n`;
    }
    
    const adminMailOptions = {
      from: `Easy Go Overseas <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: 'New Consultation Booking' + (englishLevel ? ' - With Eligibility Check' : ''),
      text: adminEmailText,
    };

    // Send emails (don't block response if emails fail)
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);
    
    res.json({ success: true });
  } catch (emailError) {
    // Log email error but don't fail the request since booking is already saved
    console.error('Error sending email:', emailError);
    // Still return success since booking was saved
    res.json({ 
      success: true, 
      warning: 'Booking saved successfully, but email notifications failed. Please contact us directly if needed.' 
    });
  }
});

// Error handling middleware for unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error. Please try again later or contact support.' 
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📧 Email notifications: ${process.env.EMAIL_USER && process.env.EMAIL_PASS ? 'Enabled' : 'Disabled'}`);
  console.log(`🔐 Encryption: ${process.env.SECRET_KEY ? 'Enabled' : 'Using default (not secure for production)'}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}); 