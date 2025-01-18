"use client"
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Inter, Cormorant_Garamond, Great_Vibes } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
});
const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
});

const WeddingInvitation = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showSidePages, setShowSidePages] = useState(false);
  const router = useRouter();

  const handleReservationClick = () => {
    setIsPressed(true);
    setIsFlipping(true);
    setTimeout(() => {
      setShowSidePages(true);
    }, 800); // Increased delay for smoother transition
  };

  const handleBack = () => {
    const timeline = async () => {

      // Wait for side pages to animate out
      await new Promise(resolve => setTimeout(resolve, 800));

      // Then reset all states
      setShowSidePages(false);
      setIsFlipping(false);
      setIsPressed(false);
    };

    timeline();
  };

  // Front card variants
  const cardVariants = {
    initial: {
      opacity: 0,
      rotateY: -90,
      x: '-50%',
      transformOrigin: 'left center',
    },
    animate: {
      rotateY: -90,
      opacity: 0,
      x: '-50%',
      transformOrigin: 'left center',
      transition: {
        type: "spring",
        stiffness: 45,
        damping: 15,
        mass: 0.5,
      }
    },
    visible: {
      rotateY: 0,
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 45,
        damping: 15,
        mass: 0.5,
      }
    },
    exit: {
      opacity: 0,
      rotateY: -90,
      x: '-50%',
      transformOrigin: 'left center',
      transition: {
        type: "spring",
        stiffness: 45,
        damping: 15,
        mass: 0.5,
      }
    }
  };

  // Side pages variants
  const sidePageVariants = {
    initial: { 
      opacity: 0,
      rotateY: -90,
      transformOrigin: 'left center',
      perspective: 1000,
    },
    animate: { 
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 45,
        damping: 15,
        mass: 0.5,
      }
    },
    exit: {
      opacity: 0,
      rotateY: -90,
      transformOrigin: 'left center',
      transition: {
        type: "spring",
        stiffness: 45,
        damping: 15,
        mass: 0.5,
      }
    }
  };

  // Left page variants (static)
  const leftPageVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      }
    }
  };

  // Right page variants (folding)
  const rightPageVariants = {
    initial: {
      rotateY: -90,
      transformOrigin: 'left center',
      opacity: 0,
    },
    animate: {
      rotateY: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 45,
        damping: 15,
        mass: 0.5,
      }
    },
    exit: {
      rotateY: -90,
      opacity: 0,
      transformOrigin: 'left center',
      transition: {
        type: "spring",
        stiffness: 45,
        damping: 15,
        mass: 0.5,
      }
    }
  };

  // Book spine animation
  const spineVariants = {
    initial: {
      scaleY: 0,
      opacity: 0,
    },
    animate: {
      scaleY: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
      }
    },
    exit: {
      scaleY: 0,
      opacity: 0,
      transition: {
        duration: 0.2,
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 flex items-center justify-center ${inter.className}`}>
      <style jsx global>{`
        @media (max-width: 768px) {
          :root {
            /* Original offsets for main card */
            --flower-header-offset: -150px;
            --flower-footer-offset: -150px;
            /* New offsets for side pages */
            --sidepage-flower-header-offset: -80px;
            --sidepage-flower-footer-offset: -80px;
          }
          .book-pages-container {
            flex-direction: column;
            gap: 1rem;
          }
          
          .book-page-left, .book-page-right {
            width: 100%;
            max-width: none;
          }

          .book-spine {
            display: none;
          }
        }
        @media (min-width: 769px) {
          :root {
            /* Original offsets for main card */
            --flower-header-offset: -310px;
            --flower-footer-offset: -350px;
            /* New offsets for side pages */
            --sidepage-flower-header-offset: -250px;
            --sidepage-flower-footer-offset: -260px;
          }
        }
        .card-container {
          perspective: 2000px;
          transform-style: preserve-3d;
          width: 100%;
          max-width: 2xl;
          position: relative;
        }
        .page-curl {
          transform-origin: left center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        .book-page {
          transform-style: preserve-3d;
          backface-visibility: hidden;
          perspective: 2000px;
        }
        .book-page-right {
          transform-origin: left center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          perspective: 2000px;
          box-shadow: -5px 0 15px rgba(0,0,0,0.1);
        }
        .perspective-[2000px] {
          perspective: 2000px;
        }

        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* Add a subtle shadow effect for depth */
        .shadow-3d {
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        /* Add to your global CSS */
        .perspective-[2000px] {
          perspective: 2000px;
        }

        .book-page-left {
          transform-origin: right center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        .book-page-right {
          transform-origin: left center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        /* Add to your global CSS */
        .perspective-[2000px] {
          perspective: 2000px;
        }

        .book-page-left {
          transform-origin: right center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        .book-page-right {
          transform-origin: left center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
      `}</style>

      <div className="card-container">
        {/* Back Button */}
        {showSidePages && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-4 left-4 z-50"
          >
            <Button
              variant="ghost"
              className="rounded-full p-3 hover:bg-[#0A5741] hover:text-white transition-colors"
              onClick={handleBack}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Front Card */}
          {!showSidePages && (
            <motion.div 
              key="invitation-card"
              className="page-curl w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl px-8 py-12 relative overflow-hidden"
              variants={cardVariants}
              initial="initial"
              animate={isFlipping ? "animate" : "visible"}
              exit="exit"
            >
              {/* Front card content */}
              <div className="absolute right-0 w-full overflow-visible">
                <div className="relative w-full -translate-y-16" style={{ top: 'var(--flower-header-offset)' }}>
                  <Image
                    width={800}
                    height={200}
                    src="/card_design/top_flower.webp"
                    alt="Lilac flowers"
                    className="w-full object-contain"
                    priority
                  />
                </div>
              </div>

              <motion.div 
                className="text-center space-y-6 mt-32 mb-32 z-10 relative"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h1 className={`text-[#0A5741] text-2xl tracking-wider font-light ${cormorant.className}`}>
                  SAVE THE DATE
                </h1>

                <div className="space-y-6">
                  <p className={`text-[#0A5741] text-6xl ${greatVibes.className}`}>
                    Ronn
                  </p>

                  <p className={`text-[#0A5741] text-2xl font-light ${cormorant.className}`}>
                    AND
                  </p>

                  <p className={`text-[#0A5741] text-6xl ${greatVibes.className}`}>
                    Leinette
                  </p>
                </div>

                <div className="space-y-6">
                  <p className={`text-[#0A5741] text-lg tracking-wide font-light ${cormorant.className}`}>
                    TOGETHER WITH THEIR FAMILIES
                  </p>

                  <p className={`text-[#0A5741] text-lg tracking-wide font-light ${cormorant.className}`}>
                    INVITE YOU TO THEIR WEDDING CELEBRATION
                  </p>

                  <div className="space-y-2">
                    <p className={`text-[#0A5741] text-2xl font-light ${cormorant.className}`}>
                      FRIDAY <span className="text-4xl px-2">24</span> AT 2 PM
                    </p>

                    <p className={`text-[#0A5741] text-2xl font-light ${cormorant.className}`}>
                      OCTOBER 2025
                    </p>
                  </div>

                  <p className={`text-[#0A5741] text-xl font-light ${cormorant.className}`}>
                    GOSHEN HOTEL AND RESORT BAMBAN,TARLAC
                  </p>
                </div>

                <motion.div 
                  className="w-full flex justify-center mt-8"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className={`rounded-full shadow-lg 
                      bg-[url('/card_design/2.png')] bg-center bg-cover bg-no-repeat
                      text-[#0A5741]
                      font-semibold whitespace-nowrap
                      transform transition-all duration-300 ease-in-out
                      hover:shadow-xl
                      text-base px-8 py-3
                      ${isPressed ? 'scale-95 opacity-80' : ''}
                      hover:bg-purple-50`}
                    onClick={handleReservationClick}
                  >
                    <span className="block">
                      Open Invitation
                    </span>
                  </Button>
                </motion.div>
              </motion.div>

              <div className="absolute left-0 bottom-0 w-full overflow-visible">
                <div className="relative w-full translate-y-16" style={{ bottom: 'var(--flower-footer-offset)', transform: 'rotate(180deg)' }}>
                  <Image
                    width={800}
                    height={200}
                    src="/card_design/top_flower.webp"
                    alt="Lilac flowers"
                    className="w-full object-contain"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Side Pages */}
          {showSidePages && (
            <div className="relative w-full perspective-[2000px]">
              <div className="relative book-pages-container flex md:flex-row flex-col justify-center items-stretch min-h-[750px] md:min-h-[850px] gap-4 md:gap-0">
                {/* Left Page Container */}
                <motion.div
                  className="w-full max-w-2xl book-page-left flex"
                  initial={{ 
                    rotateY: 90,
                    x: '50%',
                    opacity: 0 
                  }}
                  animate={{ 
                    rotateY: 0,
                    x: 0,
                    opacity: 1 
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 45,
                    damping: 15,
                    mass: 0.5
                  }}
                >
                  <div className="w-full bg-white rounded-l-3xl shadow-2xl px-8 py-12 relative overflow-hidden flex-1">
                    {/* Flower Overlays */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Top Flower */}
                      <div 
                        className="absolute w-full overflow-visible mix-blend-multiply"
                        style={{ 
                          top: 'var(--sidepage-flower-header-offset)',
                          transform: 'translateY(-80px)'
                        }}
                      >
                        <Image
                          width={800}
                          height={200}
                          src="/card_design/top_flower.webp"
                          alt="Lilac flowers"
                          className="w-full object-contain"
                          priority
                        />
                      </div>
                      {/* Bottom Flower */}
                      <div 
                        className="absolute w-full overflow-visible mix-blend-multiply"
                        style={{ 
                          bottom: 'var(--sidepage-flower-footer-offset)',
                          transform: 'translateY(80px) rotate(180deg)'
                        }}
                      >
                        <Image
                          width={800}
                          height={200}
                          src="/card_design/top_flower.webp"
                          alt="Lilac flowers"
                          className="w-full object-contain"
                          priority
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className={`text-center space-y-8 mt-32 mb-32 ${cormorant.className}`}>
                        <h2 className="text-[#0A5741] text-3xl font-light">Dress Code & Motif</h2>
                        
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-[#0A5741] text-xl font-medium">Colors</h3>
                            <p className="text-[#0A5741] text-lg">Sage Green • Cream • Gold</p>
                          </div>

                          <div>
                            <h3 className="text-[#0A5741] text-xl font-medium">Ladies</h3>
                            <p className="text-[#0A5741] text-lg">Long Dress or Formal Attire</p>
                          </div>

                          <div>
                            <h3 className="text-[#0A5741] text-xl font-medium">Gentlemen</h3>
                            <p className="text-[#0A5741] text-lg">Formal Suit or Barong Tagalog</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Book Spine */}
                <motion.div 
                  className="book-spine hidden md:block w-1 bg-gradient-to-r from-gray-300 to-gray-200 shadow-inner self-stretch"
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                />

                {/* Right Page Container */}
                <motion.div
                  className="w-full max-w-2xl book-page-right flex"
                  initial={{ 
                    rotateY: -90,
                    x: '-50%',
                    opacity: 0 
                  }}
                  animate={{ 
                    rotateY: 0,
                    x: 0,
                    opacity: 1 
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 45,
                    damping: 15,
                    mass: 0.5
                  }}
                >
                  <div className="w-full bg-white rounded-r-3xl shadow-2xl px-8 py-12 relative overflow-hidden flex-1">
                    {/* Flower Overlays */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Top Flower */}
                      <div 
                        className="absolute w-full overflow-visible mix-blend-multiply"
                        style={{ 
                          top: 'var(--sidepage-flower-header-offset)',
                          transform: 'translateY(-80px)'
                        }}
                      >
                        <Image
                          width={800}
                          height={200}
                          src="/card_design/top_flower.webp"
                          alt="Lilac flowers"
                          className="w-full object-contain"
                          priority
                        />
                      </div>
                      {/* Bottom Flower */}
                      <div 
                        className="absolute w-full overflow-visible mix-blend-multiply"
                        style={{ 
                          bottom: 'var(--sidepage-flower-footer-offset)',
                          transform: 'translateY(80px) rotate(180deg)'
                        }}
                      >
                        <Image
                          width={800}
                          height={200}
                          src="/card_design/top_flower.webp"
                          alt="Lilac flowers"
                          className="w-full object-contain"
                          priority
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className={`text-center space-y-8 mt-32 mb-32 ${cormorant.className}`}>
                        <h2 className="text-[#0A5741] text-3xl font-light">Reservation</h2>
                        
                        <div className="space-y-6">
                          <p className="text-[#0A5741] text-lg">
                            We would be honored to have you join us on our special day
                          </p>

                          <Button
                            className="rounded-full shadow-lg 
                              bg-[#0A5741] text-white
                              font-semibold whitespace-nowrap
                              transform transition-all duration-300 ease-in-out
                              hover:shadow-xl hover:bg-[#0B6B4F]
                              text-base px-8 py-3"
                            onClick={() => router.push("/reservation")}
                          >
                            Make a Reservation
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WeddingInvitation;