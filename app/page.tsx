import HomePage from '@/pages/HomePage';
import InvitationCard from './invitationcard/page';
import Link from 'next/link';

export default function Home() {
  return (
  <div>
    <Link href="/invitationcard">Make a Reservation</Link>
  </div>
  );
}
