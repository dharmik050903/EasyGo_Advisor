# EasyGo Backend Server

This is a minimal Node.js/Express backend for handling consultation bookings and sending emails for the EasyGo Overseas website.

## Setup Instructions

1. **Navigate to the server directory:**
   ```
   cd server
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the `server` directory with the following content:
     ```env
     EMAIL_USER=your_gmail_address@gmail.com
     EMAIL_PASS=your_gmail_app_password
     ADMIN_EMAIL=admin_email@example.com
     PORT=5000
     ```
   - Replace `your_gmail_address@gmail.com` and `your_gmail_app_password` with your actual Gmail and app password.
   - `ADMIN_EMAIL` is where admin notifications will be sent (can be the same as `EMAIL_USER`).

4. **Start the server:**
   ```
   npm start
   ```

5. **The server will run on `http://localhost:5000` by default.**

## API Endpoint

- **POST `/api/book-consultation`**
  - Expects JSON body with: `name`, `email`, `phone`, `service`, `preferredDate`, `message` (optional)
  - Sends confirmation email to user and notification to admin.

## Notes
- For Gmail, you may need to set up an App Password if you have 2FA enabled.
- Never commit your `.env` file to version control. 