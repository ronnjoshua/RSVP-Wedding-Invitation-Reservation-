import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Confirmation = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold">Thank You!</h1>
      <p className="mt-4">Your reservation has been submitted successfully.</p>
      <Link href="/">
        <Button className="mt-6">Back to Home</Button>
      </Link>
    </div>
  </div>
);

export default Confirmation;
