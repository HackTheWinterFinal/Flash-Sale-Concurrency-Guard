const redis = require("../config/redis");
const Booking = require("../models/Booking");
const { isIdempotent, markIdempotent } = require("../utils/idempotency");
const kafkaProducer = require("../kafka/producer");

exports.pay = async (bookingId) => {
  const key = `payment:${bookingId}`;

  // 1. Idempotency Check
  if (await isIdempotent(key)) return "ALREADY_PAID";

  let booking = await Booking.findOne({ bookingId });
  let isTemp = false;

  if (!booking) {
    // Check Redis for temporary booking
    const tempBookingStr = await redis.get(`tempBooking:${bookingId}`);
    if (tempBookingStr) {
      booking = JSON.parse(tempBookingStr);
      isTemp = true;
    } else {
      return "PAYMENT_EXPIRED"; // Booking not found in DB or Redis (expired)
    }
  }

  if (booking.status === "CONFIRMED") return "ALREADY_PAID";
  if (booking.status === "FAILED") return "BOOKING_FAILED";

  // 1.5 Validate Locks (Check if 60s window is still active)
  if (booking.seatIds && booking.seatIds.length > 0) {
    for (const seatId of booking.seatIds) {
      const lockValue = await redis.get(`seat:${seatId}`);
      if (lockValue !== bookingId) {
        // Lock expired or taken by someone else
        if (!isTemp) {
            await Booking.updateOne({ bookingId }, { status: "TIMEOUT" });
        }
        return "PAYMENT_EXPIRED"; // or TIMEOUT
      }
    }
  }

  try {
    // 2. Simulate Payment Gateway
    // For demo purposes, we can simulate failure for specific IDs if needed
    console.log(`Processing payment for booking: ${bookingId}`);
    await new Promise((r) => setTimeout(r, 300));

    // 3. Update Status and Key (Atomic-like update)
    await markIdempotent(key, "true");
    
    if (isTemp) {
        // Create the booking in MongoDB now
        await Booking.create({
            ...booking,
            status: "CONFIRMED"
        });
        
        // Remove temporary key from Redis
        await redis.del(`tempBooking:${bookingId}`);
    } else {
        await Booking.updateOne({ bookingId }, { status: "CONFIRMED" });
    }

    // Publish event
    await kafkaProducer.publish("BOOKING_CREATED", {
        bookingId,
        seatIds: booking.seatIds,
    });

    return "SUCCESS";
  } catch (err) {
    console.error("Payment failed:", err);

    // 4. Immediate Release if payment definitively fails
    if (!isTemp) {
        await Booking.updateOne({ bookingId }, { status: "FAILED" });
    }
    
    if (booking.seatIds) {
      for (const seatId of booking.seatIds) {
        await redis.del(`seat:${seatId}`);
      }
    }

    return "PAYMENT_FAILED";
  }
};
