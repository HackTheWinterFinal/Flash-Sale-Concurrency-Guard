// controllers/seat.controller.js
const redis = require("../config/redis");
const Booking = require("../models/Booking");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");
const kafkaProducer = require("../kafka/producer");

const lua = fs.readFileSync(
  path.join(__dirname, "../redis/seatLock.lua"),
  "utf8",
);

exports.reserveSeats = async (req, res) => {
  const { seatIds, movieId, price } = req.body;
  const userId = req.userData.userId;

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ message: "No seats selected" });
  }

  const bookingId = uuid();
  const lockedSeats = [];

  try {
    for (const seatId of seatIds) {
      // Lock for 60 seconds (60000 ms) as per requirement
      const locked = await redis.eval(lua, 1, `seat:${seatId}`, bookingId, 60000);
      if (!locked) {
        // Rollback already acquired locks
        for (const id of lockedSeats) {
          await redis.del(`seat:${id}`);
        }
        return res.status(409).json({ message: `Seat ${seatId} already booked` });
      }
      lockedSeats.push(seatId);
    }

    // Store temporary booking in Redis for 60 seconds
    const tempBookingData = {
      bookingId,
      seatIds,
      userId,
      movieId,
      amount: price * seatIds.length,
      status: "PENDING",
      createdAt: Date.now(),
    };

    await redis.set(
      `tempBooking:${bookingId}`,
      JSON.stringify(tempBookingData),
      "EX",
      60
    );

    // Note: We do NOT create a MongoDB record here. 
    // We also moved Kafka publishing to the payment service, 
    // as the booking is only "real" after payment.

    res.json({ bookingId });
  } catch (error) {
    for (const id of lockedSeats) {
      await redis.del(`seat:${id}`);
    }
    res.status(500).json({ message: "Reservation failed", error: error.message });
  }
};
