// models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  seatIds: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "FAILED"],
  },
  amount: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", BookingSchema);
