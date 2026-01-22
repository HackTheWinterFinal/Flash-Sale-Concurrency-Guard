const paymentService = require("../services/payment.services");
const Booking = require("../models/Booking");

exports.pay = async (req, res) => {
  const result = await paymentService.pay(req.params.bookingId);
  res.json({ status: result });
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking", error: error.message });
  }
};
