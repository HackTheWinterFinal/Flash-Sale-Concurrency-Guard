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
  const { seatIds } = req.body;
  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ message: "No seats selected" });
  }

  const bookingId = uuid();
  const lockedSeats = [];

  try {
    for (const seatId of seatIds) {
      const locked = await redis.eval(lua, 1, `seat:${seatId}`, bookingId, 300000);
      if (!locked) {
        // Rollback already acquired locks
        for (const id of lockedSeats) {
          await redis.del(`seat:${id}`);
        }
        return res.status(409).json({ message: `Seat ${seatId} already booked` });
      }
      lockedSeats.push(seatId);
    }

    await Booking.create({
      bookingId,
      seatIds,
      status: "PENDING",
    });

    await kafkaProducer.publish("BOOKING_CREATED", {
      bookingId,
      seatIds,
    });

    res.json({ bookingId });
  } catch (error) {
    for (const id of lockedSeats) {
      await redis.del(`seat:${id}`);
    }
    res.status(500).json({ message: "Reservation failed", error: error.message });
  }
};
