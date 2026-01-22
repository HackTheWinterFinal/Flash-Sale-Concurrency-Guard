// models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  seatId: String,
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "FAILED"],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", BookingSchema);
