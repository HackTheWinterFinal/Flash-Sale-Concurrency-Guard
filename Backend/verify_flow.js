const axios = require('axios');
const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
const redis = require('./src/config/redis');
require('dotenv').config({ path: './src/.env' });

const API_URL = 'http://localhost:5000/api';
const USER_EMAIL = 'verify@test.com'; // Ensure this user exists or create functionality
const USER_PASSWORD = 'password123';

async function connectDB() {
  console.log('Loading env from ./.env');
  require('dotenv').config({ path: './.env' });
  console.log('MONGO_URI present:', !!process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Mongo connection failed:', err);
    process.exit(1);
  }
}

async function login() {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    return res.data.token;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 404) {
       console.log('User needs signup/login retry...');
       // Try signup
       try {
         await axios.post(`${API_URL}/auth/signup`, {
           name: 'Verify User',
           email: USER_EMAIL,
           password: USER_PASSWORD,
           role: 'user'
         });
       } catch (signupErr) {
           console.log('Signup might have failed if user exists but wrong pwd, continuing to login attempt...');
       }
       
       const res = await axios.post(`${API_URL}/auth/login`, {
        email: USER_EMAIL,
        password: USER_PASSWORD
      });
      return res.data.token;
    }
    throw error;
  }
}

async function runTest() {
  await connectDB();
  const token = await login();
  console.log('Logged in.');

  // 1. Get a movie
  const moviesRes = await axios.get(`${API_URL}/movies`);
  const movie = moviesRes.data[0];
  if (!movie) throw new Error('No movies found');
  console.log(`Using movie: ${movie.title} (${movie._id})`);

  // 2. Reserve Seat
  const seatId = `T-${Math.floor(Math.random() * 10000)}`;
  console.log(`Reserving seat: ${seatId}`);
  
  const reserveRes = await axios.post(`${API_URL}/seats/reserve`, {
    seatIds: [seatId],
    movieId: movie._id,
    price: movie.price
  }, { headers: { Authorization: `Bearer ${token}` } });

  const bookingId = reserveRes.data.bookingId;
  console.log(`Booking ID: ${bookingId}`);

  // 3. Verify NOT in MongoDB
  const dbBooking = await Booking.findOne({ bookingId });
  if (dbBooking) {
    console.error('FAIL: Booking found in MongoDB immediately!');
  } else {
    console.log('PASS: Booking NOT found in MongoDB immediately.');
  }

  // 4. Verify IN Redis
  const redisBooking = await redis.get(`tempBooking:${bookingId}`);
  if (redisBooking) {
    console.log('PASS: Booking found in Redis.');
  } else {
    console.error('FAIL: Booking NOT found in Redis.');
  }

  // 5. Wait for expiry (65s)
  console.log('Waiting 65s for lock expiry...');
  await new Promise(r => setTimeout(r, 65000));

  // 6. Try Pay (Should Fail)
  try {
    const payRes = await axios.post(`${API_URL}/bookings/${bookingId}/pay`, {}, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    if (payRes.data.status === 'PAYMENT_EXPIRED') {
        console.log('PASS: Payment failed with PAYMENT_EXPIRED as expected.');
    } else {
        console.error(`FAIL: Payment returned unexpected status: ${payRes.data.status}`);
    }
  } catch (error) {
    if (error.response?.data?.status === 'PAYMENT_EXPIRED') {
        console.log('PASS: Payment failed with PAYMENT_EXPIRED as expected (4xx).');
    } else {
        console.log('Payment failed with error:', error.response?.data || error.message);
    }
  }

  // 7. Reserve Again - Immediate Pay
  console.log('Reserving again for immediate pay...');
  const seatId2 = `T-${Math.floor(Math.random() * 10000)}`;
  const reserveRes2 = await axios.post(`${API_URL}/seats/reserve`, {
    seatIds: [seatId2],
    movieId: movie._id,
    price: movie.price
  }, { headers: { Authorization: `Bearer ${token}` } });
  
  const bookingId2 = reserveRes2.data.bookingId;
  console.log(`Booking ID 2: ${bookingId2}`);

  // 8. Pay Immediately
  const payRes2 = await axios.post(`${API_URL}/bookings/${bookingId2}/pay`, {}, { 
      headers: { Authorization: `Bearer ${token}` } 
  });
  console.log(`Payment Status: ${payRes2.data.status}`);

  if (payRes2.data.status === 'SUCCESS') {
      console.log('PASS: Immediate payment succeeded.');
      // 9. Verify IN MongoDB
      const dbBooking2 = await Booking.findOne({ bookingId: bookingId2 });
      if (dbBooking2 && dbBooking2.status === 'CONFIRMED') {
          console.log('PASS: Booking confirmed and found in MongoDB.');
      } else {
          console.error('FAIL: Booking not found or not confirmed in MongoDB.');
      }
  } else {
      console.error('FAIL: Immediate payment failed.');
  }

  process.exit();
}

const fs = require('fs');
const util = require('util');
const logFile = fs.createWriteStream('verify_output.txt', { flags: 'a' });
const logStdout = process.stdout;

console.log = function(d) { //
  logFile.write(util.format(d) + '\n');
  logStdout.write(util.format(d) + '\n');
};
console.error = function(d) { //
  logFile.write(util.format(d) + '\n');
  logStdout.write(util.format(d) + '\n');
};

runTest().catch(err => console.error(err));
