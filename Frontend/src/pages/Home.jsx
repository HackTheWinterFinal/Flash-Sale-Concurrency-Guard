import SeatGrid from "../components/SeatGrid";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-3xl font-bold">Select Your Seat</h1>
      <SeatGrid />
    </div>
  );
}
