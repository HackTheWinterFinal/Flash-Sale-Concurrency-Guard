const redis = require("../config/redis");
const Booking = require("../models/Booking");
const { isIdempotent, markIdempotent } = require("../utils/idempotency");

exports.pay = async (bookingId) => {
  const key = `payment:${bookingId}`;

  // 1. Idempotency Check
  if (await isIdempotent(key)) return "ALREADY_PAID";

  const booking = await Booking.findOne({ bookingId });
  if (!booking) return "NOT_FOUND";
  if (booking.status === "CONFIRMED") return "ALREADY_PAID";
  if (booking.status === "FAILED") return "BOOKING_FAILED";

  try {
    // 2. Simulate Payment Gateway
    // For demo purposes, we can simulate failure for specific IDs if needed
    console.log(`Processing payment for booking: ${bookingId}`);
    await new Promise((r) => setTimeout(r, 300));

    // 3. Update Status and Key (Atomic-like update)
    await markIdempotent(key, "true");
    await Booking.updateOne({ bookingId }, { status: "CONFIRMED" });

    return "SUCCESS";
  } catch (err) {
    console.error("Payment failed:", err);

    // 4. Immediate Release if payment definitively fails
    await Booking.updateOne({ bookingId }, { status: "FAILED" });
    await redis.del(`seat:${booking.seatId}`);

    return "PAYMENT_FAILED";
  }
};
