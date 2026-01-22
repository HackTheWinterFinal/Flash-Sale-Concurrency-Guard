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

exports.reserveSeat = async (req, res) => {
  const seatId = req.params.seatId;
  const bookingId = uuid();

  const locked = await redis.eval(lua, 1, `seat:${seatId}`, bookingId, 300000);

  if (!locked) {
    return res.status(409).json({ message: "Seat already booked" });
  }

  await Booking.create({
    bookingId,
    seatId,
    status: "PENDING",
  });

  await kafkaProducer.publish("BOOKING_CREATED", {
    bookingId,
    seatId,
  });

  res.json({ bookingId });
};
