// routes/booking.routes.js
const router = require("express").Router();
const controller = require("../controllers/booking.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.post("/:bookingId/pay", controller.pay);
router.get("/mine", authMiddleware, controller.getMyBookings);
router.get("/my-rewards", authMiddleware, controller.getMyRewards);
router.get("/company", authMiddleware, controller.getCompanyBookings);
router.get("/:bookingId", controller.getBooking);
module.exports = router;
