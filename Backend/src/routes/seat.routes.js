// routes/seat.routes.js
const router = require("express").Router();
const controller = require("../controllers/seat.controller");

router.post("/:seatId/reserve", controller.reserveSeat);
module.exports = router;
