// controllers/booking.controller.js
const paymentService = require("../services/payment.services");

exports.pay = async (req, res) => {
  const result = await paymentService.pay(req.params.bookingId);
  res.json({ status: result });
};
