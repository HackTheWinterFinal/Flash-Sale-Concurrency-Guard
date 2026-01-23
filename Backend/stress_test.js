const axios = require("axios");
const { v4: uuid } = require("uuid"); // Ensure uuid is installed or use math random

const BASE_URL = "http://localhost:5000/api";
const REQUEST_COUNT = 500;
const USER_EMAIL = "stress@test.com";
const USER_PASSWORD = "password123";

async function getAuthToken() {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    return res.data.token;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 404) {
       try {
         await axios.post(`${BASE_URL}/auth/signup`, {
           name: 'Stress User',
           email: USER_EMAIL,
           password: USER_PASSWORD,
           role: 'user'
         });
       } catch (e) {}
       const res = await axios.post(`${BASE_URL}/auth/login`, {
        email: USER_EMAIL,
        password: USER_PASSWORD
      });
      return res.data.token;
    }
    throw error;
  }
}

async function runStressTest() {
  const token = await getAuthToken();
  const moviesRes = await axios.get(`${BASE_URL}/movies`);
  const movie = moviesRes.data[0];
  const movieId = movie._id;
  const price = movie.price;

  const SEAT_ID = `STRESS-${Math.floor(Math.random() * 100000)}`;

  console.log(
    ` Starting stress test: ${REQUEST_COUNT} concurrent requests for seat ${SEAT_ID} (Movie: ${movie.title})...`,
  );

  const requests = [];
  for (let i = 0; i < REQUEST_COUNT; i++) {
    requests.push(
      axios
        .post(`${BASE_URL}/seats/reserve`, { 
            seatIds: [SEAT_ID],
            movieId,
            price
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
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
    // With 20s lock, one user gets it. Others get 409.
    console.log(`\n Note: ${successCount} successes. (Should be 1)`);
  }
}

runStressTest();
