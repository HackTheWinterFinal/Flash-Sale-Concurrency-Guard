const Booking = require("../models/Booking");

exports.createBooking = async ({ bookingId, seatId }) => {
  return Booking.create({
    bookingId,
    seatId,
    status: "PENDING",
  });
};

exports.confirmBooking = async (bookingId) => {
  return Booking.updateOne({ bookingId }, { status: "CONFIRMED" });
};

exports.failBooking = async (bookingId) => {
  return Booking.updateOne({ bookingId }, { status: "FAILED" });
};

exports.getBooking = async (bookingId) => {
  return Booking.findOne({ bookingId });
};
