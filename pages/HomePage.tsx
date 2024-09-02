"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const HomePage = () => {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleReservationClick = () => {
    setIsFlipping(true);
    setTimeout(() => {
      window.location.href = "/reservation";
    }, 600); // Duration should match the animation duration
  };

  return (
    <div className="flex items-center justify-center h-screen bg-rose-100 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10 bg-[url('')] bg-cover bg-center pointer-events-none"></div>
      {/* Main Content */}
      <motion.div
        className={`text-center mx-auto p-12 bg-white shadow-2xl rounded-xl border border-gray-300 relative w-full max-w-2xl min-h-[900px] overflow-y-auto max-h-[80vh]
  sm:min-h-[500px] sm:max-w-sm md:min-h-[750px] md:max-w-xl lg:min-h-[800px] lg:max-w-xl small-screen-container ${
    isFlipping ? "page-turn" : ""
  }`} // Adjust min-height here
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Header */}
        <h1 className="text-6xl font-extrabold text-rose-600 mb-6">
          Welcome to Our Wedding
        </h1>

        {/* Subtext */}
        <p className="text-xl text-gray-700 mb-8">
          Join us for a day of love, joy, and celebration. Please RSVP by
          filling out the reservation form.
        </p>

        {/* Reservation Button */}
        <Button
          className="px-8 py-4 bg-rose-500 text-white font-semibold rounded-full shadow-lg hover:bg-rose-600 transition duration-300"
          onClick={handleReservationClick}
        >
          Make a Reservation
        </Button>
      </motion.div>
    </div>
  );
};

export default HomePage;
