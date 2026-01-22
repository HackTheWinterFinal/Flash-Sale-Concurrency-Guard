import { reserveSeat } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Seat({ seatId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await reserveSeat(seatId);
      navigate(`/checkout/${res.data.bookingId}`);
    } catch {
      alert("❌ Seat already booked!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white
                 px-6 py-3 rounded-lg font-semibold
                 disabled:bg-gray-400"
    >
      {loading ? "Reserving..." : seatId}
    </button>
  );
}
