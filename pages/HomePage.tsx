import { Button } from '@/components/ui/button';
import Link from 'next/link';

const HomePage = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold">Welcome to Our Wedding</h1>
      <p className="mt-4">Please RSVP by filling out the reservation form.</p>
      <Link href="/reservation">
        <Button className="mt-6 border-2 border-slate-500">Make a Reservation</Button>
      </Link>
    </div>
  </div>
);

export default HomePage;
