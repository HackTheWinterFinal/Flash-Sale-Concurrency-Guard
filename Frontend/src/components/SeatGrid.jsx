import Seat from "./Seat";

export default function SeatGrid() {
  const seats = ["A1"]; // single-seat stress demo

  return (
    <div className="grid grid-cols-3 gap-6">
      {seats.map((seat) => (
        <Seat key={seat} seatId={seat} />
      ))}
    </div>
  );
}
