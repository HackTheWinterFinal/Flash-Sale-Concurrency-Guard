// routes/seat.routes.js
const router = require("express").Router();
const controller = require("../controllers/seat.controller");

router.post("/reserve", controller.reserveSeats);
module.exports = router;
