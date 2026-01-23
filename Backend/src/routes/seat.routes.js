// routes/seat.routes.js
const router = require("express").Router();
const controller = require("../controllers/seat.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.post("/reserve", authMiddleware, controller.reserveSeats);
module.exports = router;
