// routes/booking.routes.js
const router = require("express").Router();
const controller = require("../controllers/booking.controller");

router.post("/:bookingId/pay", controller.pay);
module.exports = router;
