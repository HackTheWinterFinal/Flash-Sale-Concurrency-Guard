export default function Success() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-green-100 border border-green-400 p-8 rounded-lg text-center">
        <h1 className="text-3xl font-bold text-green-700">
          ✅ Booking Confirmed
        </h1>
        <p className="mt-4 text-gray-700">Your seat is successfully booked.</p>
      </div>
    </div>
  );
}
