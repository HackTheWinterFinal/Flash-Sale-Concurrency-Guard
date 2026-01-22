const express = require("express");
const cors = require("cors");

const seatRoutes = require("./routes/seat.routes");
const bookingRoutes = require("./routes/booking.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

module.exports = app;
