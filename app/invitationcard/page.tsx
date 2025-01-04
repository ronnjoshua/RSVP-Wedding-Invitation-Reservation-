"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const router = useRouter();

  const handleReservationClick = () => {
    setIsPressed(true);
    setIsFlipping(true);
    setTimeout(() => {
      router.push("/reservation");
    }, 500); // Increased duration to match animation
  };

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <motion.div
        className={`form-container relative flex flex-col items-center justify-end
          mx-auto bg-white shadow-2xl rounded-xl border border-gray-300 
          bg-[url('/card_design/front_card.png')] bg-center bg-cover bg-no-repeat
          transition-transform duration-500 ease-in-out
          ${isFlipping ? "rotate-y-180 scale-95 opacity-0" : ""}
          
          /* Mobile - use full viewport height */
          h-screen w-full p-4 pb-20
          
          /* Tablet */
          sm:h-[90vh] sm:w-[90%] sm:max-w-lg sm:pb-24 sm:p-6
          
          /* Desktop */
          md:h-[95vh] md:max-w-xl md:pb-28 md:p-8
          lg:h-[85vh] lg:max-w-2xl lg:pb-32 lg:p-12`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="w-full flex justify-center
          /* Mobile button position */
            absolute bottom-32
            
            /* Tablet button position */
            sm:bottom-24
            
            /* Desktop button position */
            md:bottom-28
            lg:bottom-32"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            className={`rounded-full shadow-lg 
              bg-[url('/card_design/2.png')] bg-center bg-cover bg-no-repeat
              text-customGreen
              font-semibold whitespace-nowrap
              transform transition-all duration-300 ease-in-out
              active:scale-95
              hover:scale-105 hover:shadow-xl
              
              /* Mobile */
              text-base px-8 py-3
              
              /* Tablet */
              sm:text-lg sm:px-10 sm:py-4
              
              /* Desktop */
              md:text-xl md:px-12 md:py-4
              lg:text-2xl lg:px-14 lg:py-5
              
              /* Animation classes */
              ${isPressed ? 'scale-95 opacity-80' : ''}
              hover:bg-customHoverLilac hover:text-customDarkLilac
              active:bg-customHoverLilac active:text-customDarkLilac`}
            onClick={handleReservationClick}
          >
            <span className="block">
              Make a Reservation
            </span>
          </Button>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        @keyframes rotate-y-180 {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(180deg);
          }
        }

        .rotate-y-180 {
          animation: rotate-y-180 0.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;