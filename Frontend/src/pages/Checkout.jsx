import { useParams, useNavigate } from "react-router-dom";
import { payBooking } from "../services/api";
import { useState } from "react";

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      await payBooking(bookingId);
      navigate("/success");
    } catch {
      navigate("/failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h2 className="text-2xl font-semibold">Checkout</h2>

      <p className="text-gray-700">
        Booking ID: <span className="font-mono">{bookingId}</span>
      </p>

      <button
        onClick={handlePay}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white
                   px-8 py-3 rounded-lg
                   disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
