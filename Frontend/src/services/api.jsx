import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const reserveSeat = (seatId) => api.post(`/seats/${seatId}/reserve`);

export const payBooking = (bookingId) => api.post(`/bookings/${bookingId}/pay`);
