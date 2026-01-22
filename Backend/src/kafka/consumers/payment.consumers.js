const kafka = require("../../config/kafka");
const paymentService = require("../../services/payment.services");

const consumer = kafka.consumer({
  groupId: "payment-group",
});

(async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "BOOKING_CREATED",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      const { bookingId } = event;

      try {
        // Optional: pre-authorize, fraud checks, etc.
        console.log("Payment workflow started for", bookingId);

        // No auto-charge here (user still clicks Pay)
        // This consumer prepares payment context
      } catch (err) {
        console.error("Payment consumer error", err);
      }
    },
  });
})();
