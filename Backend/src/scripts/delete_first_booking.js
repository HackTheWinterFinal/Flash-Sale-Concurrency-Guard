const mongoose = require('mongoose');
const path = require('path');
const Booking = require('../models/Booking');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const deleteFirstBooking = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Find the first booking (oldest by creation time)
    const booking = await Booking.findOne().sort({ createdAt: 1 });

    if (!booking) {
      console.log("No bookings found to delete.");
    } else {
      console.log(`Found booking to delete: ${booking.bookingId}`);
      await Booking.deleteOne({ _id: booking._id });
      console.log(`Successfully deleted booking: ${booking.bookingId}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Deletion failed:", error);
    process.exit(1);
  }
};

deleteFirstBooking();
