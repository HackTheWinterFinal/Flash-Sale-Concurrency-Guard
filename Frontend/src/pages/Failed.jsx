export default function Failed() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-100 border border-red-400 p-8 rounded-lg text-center">
        <h1 className="text-3xl font-bold text-red-700">❌ Payment Failed</h1>
        <p className="mt-4 text-gray-700">Please try again.</p>
      </div>
    </div>
  );
}
