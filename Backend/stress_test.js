const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";
const SEAT_ID = "A1";
const REQUEST_COUNT = 500;

async function runStressTest() {
  console.log(
    ` Starting stress test: ${REQUEST_COUNT} concurrent requests for seat ${SEAT_ID}...`,
  );

  const requests = [];
  for (let i = 0; i < REQUEST_COUNT; i++) {
    requests.push(
      axios
        .post(`${BASE_URL}/seats/reserve`, { seatIds: [SEAT_ID] })
        .then((res) => ({ status: "success", data: res.data }))
        .catch((err) => ({
          status: "fail",
          error: err.response?.status || err.message,
        })),
    );
  }

  const results = await Promise.all(requests);

  const successCount = results.filter((r) => r.status === "success").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const conflictCount = results.filter((r) => r.error === 409).length;

  console.log("\n--- Stress Test Results ---");
  console.log(`Total Requests: ${REQUEST_COUNT}`);
  console.log(`Successes:      ${successCount}`);
  console.log(`Failures:       ${failCount}`);
  console.log(`Conflicts(409): ${conflictCount}`);

  if (successCount === 1) {
    console.log("\n Test Passed: Exactly 1 user successfully booked the seat.");
  } else {
    console.log(`\n Test Failed: ${successCount} users booked the seat.`);
  }
}

runStressTest();
