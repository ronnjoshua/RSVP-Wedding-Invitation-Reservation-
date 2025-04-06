"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, FlowerIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inter, Great_Vibes, Cormorant_Garamond } from 'next/font/google';
import Image from 'next/image';

// Font configurations
const inter = Inter({ subsets: ['latin'] });
const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400'
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500']
});

interface EnvelopeAnimationProps {
  onOpenComplete: () => void;
}

const EnvelopeAnimation: React.FC<EnvelopeAnimationProps> = ({ onOpenComplete }) => {
  const [stage, setStage] = useState<number>(0);

  const handleSealClick = () => {
    setStage(1);
  };

  const handleOpenComplete = () => {
    onOpenComplete();
  };

  // Lilac and Sage Green Color Palette
  const colors = {
    background: "from-[#E6E6FA] via-[#F0FFF0] to-[#E6E6FA]",
    envelope: {
        base: "from-[#F2E6F9] to-[#E6D0F0]" 
    },
    text: {
      primary: "text-[#0A5741]",
      secondary: "text-[#0A5741]"
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${colors.background}`}
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0,
          transition: { duration: 0.5 }
        }}
      >
        <motion.div 
          className="relative w-[400px] h-[300px]"
          initial={{ 
            scale: 0.8, 
            opacity: 0 
          }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            transition: { 
              duration: 1,
              ease: "easeOut"
            }
          }}
        >
          {/* Initial State: Interactive Seal */}
          {stage === 0 && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSealClick}
            >
              <div className="w-48 h-48 from-[#9370DB] to-[#BA55D3] rounded-full shadow-2xl flex items-center justify-center overflow-hidden">
                <Image 
                  src="/seal.png" 
                  alt="Seal" 
                  width={400} 
                  height={120} 
                  className="opacity-80"
                />
                <p className={`absolute bottom-4 ${cormorant.className} text-black text-sm`}>
                  Click to Open
                </p>
              </div>
            </motion.div>
          )}

          {/* Rest of the code remains the same as the original */}
          {stage >= 1 && (
            <>
              {/* Envelope Base with Card peeking */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${colors.envelope.base} rounded-2xl shadow-2xl`}
              >
                {/* Envelope Base shadow to simulate card half showing */}
                <motion.div
                  className="absolute inset-x-0 bottom-0 bg-white shadow-md h-24 rounded-b-2xl"
                  initial={{ y: 40 }}
                  animate={{ y: 0, transition: { duration: 0.8, ease: "easeOut" } }}
                />
                <motion.div
                  className="absolute inset-x-0 bottom-0 bg-[#f9e7f9] shadow-lg rounded-b-2xl h-20"
                  initial={{ scaleY: 0.5 }}
                  animate={{ scaleY: 1, transition: { duration: 0.8, ease: "easeOut" } }}
                />
                {/* Text indicator to click */}
                <motion.div
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-lg text-white cursor-pointer"
                  onClick={handleSealClick}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.6, duration: 0.6 }}}
                >
                  <p className={`${cormorant.className} font-semibold`}>
                    Click to Open Invitation
                  </p>
                </motion.div>
              </motion.div>

              {/* Invitation Card */}
              <motion.div
                className="absolute inset-x-4 bottom-4 z-10"
                initial={{ 
                  y: 0, 
                  opacity: 0,
                  scale: 0.9
                }}
                animate={{ 
                  y: stage >= 2 ? -100 : 0,
                  opacity: stage >= 2 ? 1 : 0,
                  scale: stage >= 2 ? 1 : 0.9,
                  transition: {
                    duration: 1,
                    ease: "easeInOut"
                  }
                }}
              >
                <Card 
                  className="w-full overflow-hidden bg-white shadow-2xl rounded-2xl border-0"
                  onClick={() => stage < 3 && setStage(3)}
                >
                  <CardContent className="p-8 text-center">
                    <motion.div
                      initial={{ 
                        opacity: 0, 
                        y: 20 
                      }}
                      animate={{ 
                        opacity: stage >= 3 ? 1 : 0,
                        y: stage >= 3 ? 0 : 20,
                        transition: {
                          duration: 0.8
                        }
                      }}
                      className="space-y-4"
                    >
                      <Heart
                        className={`mx-auto ${colors.text.secondary}`}
                        fill="#90EE90"
                        strokeWidth={1}
                        size={56}
                      />
                      <h2 className={`text-2xl ${colors.text.primary} ${greatVibes.className}`}>
                        You&apos;re Cordially Invited
                      </h2>
                      <p className={`text-base ${colors.text.secondary}/80 ${cormorant.className}`}>
                        To Celebrate the Wedding of
                      </p>
                      <p className={`text-3xl ${colors.text.primary} ${greatVibes.className}`}>
                        Ronn & Leinette
                      </p>
                      <p className={`text-sm ${colors.text.secondary}/70 ${cormorant.className}`}>
                        Friday, October 24, 2025
                      </p>
                      
                      {stage === 3 && (
                        <Button 
                          onClick={handleOpenComplete}
                          className={`mt-4 bg-[#9370DB] hover:bg-[#8A2BE2] text-white`}
                        >
                          Open Invitation
                        </Button>
                      )}
                    </motion.div>
                  </CardContent>
                </Card>
                
                {/* Decorative Shadow */}
                <motion.div
                  className="absolute -bottom-8 left-0 right-0 h-8 bg-[#9370DB] opacity-50 blur-sm rounded-b-2xl"
                  initial={{ scaleX: 0.9 }}
                  animate={{
                    scaleX: stage >= 2 ? 1 : 0.9,
                    transition: {
                      duration: 1,
                      ease: "easeInOut"
                    }
                  }}
                />
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnvelopeAnimation;