const axios = require('axios');
const redis = require('./src/config/redis');

const BASE_URL = 'http://localhost:5000/api';

async function verifyPendingSeats() {
    // 1. Get a movie
    const moviesRes = await axios.get(`${BASE_URL}/movies`);
    const movie = moviesRes.data[0];
    const movieId = movie._id;
    const seatId = 'PEND-1';

    console.log(`Using movie: ${movie.title} (${movieId})`);

    // 2. Lock a seat manually in Redis (simulating a "Pending" booking)
    // We use the same key format as seat.controller.js: seat:{seatId}
    console.log(`Locking seat ${seatId} in Redis...`);
    await redis.set(`seat:${seatId}`, 'test-booking-id', 'EX', 60);

    // 3. Fetch movie details
    console.log('Fetching movie details...');
    const movieRes = await axios.get(`${BASE_URL}/movies/${movieId}`);
    
    // 4. Check if pendingSeats contains our seat
    const pendingSeats = movieRes.data.pendingSeats;
    console.log('Pending Seats from API:', pendingSeats);

    if (pendingSeats && pendingSeats.includes(seatId)) {
        console.log('PASS: API correctly returns pending seat.');
    } else {
        console.error('FAIL: API failed to return pending seat.');
    }

    process.exit();
}

verifyPendingSeats().catch(console.error);
