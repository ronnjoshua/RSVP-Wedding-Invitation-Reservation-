"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const router = useRouter();

  const handleReservationClick = () => {
    setIsFlipping(true);
    setTimeout(() => {
      router.push("/reservation");
    }, 100);
  };

  return (
    <div className="flex items-center justify-center h-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"></div>
      <motion.div
        className={`form-container relative flex flex-col items-center justify-end
          mx-auto bg-white shadow-2xl rounded-xl border border-gray-300 
          w-full overflow-y-auto
          bg-[url('/card_design/front_card.png')] bg-center bg-cover
          ${isFlipping ? "page-turn" : ""}
          
          /* Mobile first approach */
          min-h-[400px] max-h-[80vh] max-w-xs p-4 pb-16
          
          /* Tablet */
          sm:min-h-[500px] sm:max-w-sm sm:p-6 sm:pb-20
          
          /* Small Desktop */
          md:min-h-[750px] md:max-w-xl md:p-8 md:pb-24
          
          /* Large Desktop */
          lg:min-h-[800px] lg:max-w-2xl lg:p-12 lg:pb-32`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="w-full flex justify-center">
          <Button
            className="rounded-full shadow-lg transition duration-300 
              bg-[url('/card_design/2.png')] bg-center bg-cover
              text-customGreen hover:bg-customHoverLilac hover:text-customDarkLilac
              
              /* Mobile */
              text-sm px-4 py-2
              
              /* Tablet */
              sm:text-base sm:px-6 sm:py-3
              
              /* Desktop */
              md:text-lg md:px-8 md:py-4
              
              /* Maintain aspect ratio with container */
              w-auto h-auto"
            onClick={handleReservationClick}
          >
            Make a Reservation
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;