import Confirmation from "@/pages/confirmation";
import HomePage from "@/pages/HomePage";
import Reservation from "@/pages/reservation";

export default function Home() {
  return (
    <div>
      <HomePage />
      <Reservation />
      <Confirmation />
    </div>
  );
}
