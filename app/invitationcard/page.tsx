"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // Use next/navigation's useRouter

const InvitationCard = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const router = useRouter(); // Correct use of useRouter from next/navigation

  const handleReservationClick = () => {
    setIsFlipping(true);
    setTimeout(() => {
      router.push("/reservation"); // Navigate using Next.js router from next/navigation
    }, 100); // Duration should match the animation duration
  };

  return (
    <div className="flex items-center justify-center h-screen relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none"></div>
      {/* Main Content */}
      <motion.div
        className={`form-container relative flex flex-col justify-center text-center mx-auto p-12 bg-white shadow-2xl rounded-xl border border-gray-300 w-full max-w-2xl min-h-[900px] overflow-y-auto max-h-[80vh]
          sm:min-h-[500px] sm:max-w-sm md:min-h-[750px] md:max-w-xl lg:min-h-[800px] lg:max-w-xl bg-[url('/card_design/front_card.png')] bg-center bg-cover ${
            isFlipping ? "page-turn" : ""
          }`} // Adjust min-height here
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Reservation Button */}
        <Button
          className="px-8 py-4 text-customGreen font-semibold rounded-full shadow-lg hover:bg-customHoverLilac hover:text-customDarkLilac transition duration-300 bg-[url('/card_design/2.png')] bg-center bg-cover absolute bottom-[132px] left-1/2 transform -translate-x-1/2"
          onClick={handleReservationClick}
        >
          Make a Reservation
        </Button>
      </motion.div>
    </div>
  );
};

export default InvitationCard;
