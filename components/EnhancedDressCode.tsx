import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Cormorant_Garamond } from 'next/font/google';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';

// Font configuration
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
});

const EnhancedDressCode = () => {
  const [isMobile, setIsMobile] = useState(false);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Trigger animations when component is in view
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  // Mobile-specific animations
  const mobileItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      className="max-w-4xl mx-auto"
    >
      {/* Elegant Title */}
      <motion.h2 
        variants={isMobile ? mobileItemVariants : itemVariants}
        className={`text-2xl text-[#0A5741] font-medium text-center mb-6 ${cormorant.className}`}
      >
        Dress Code & Color Palette
      </motion.h2>
      
      {/* Color Palette */}
      <motion.div 
        variants={isMobile ? mobileItemVariants : itemVariants}
        className="flex flex-col items-center justify-center mb-8"
      >
        <div className="flex items-center justify-center mb-3 gap-4">
          <div className="h-10 w-10 rounded-full bg-[#8fbc8f] shadow-sm transform transition-transform hover:scale-110"></div>
          <div className="h-10 w-10 rounded-full bg-[#D6CAB0] shadow-sm transform transition-transform hover:scale-110"></div>
        </div>
        <p className={`text-lg text-[#0A5741] italic ${cormorant.className}`}>Sage Green • Beige</p>
      </motion.div>
      
      {/* Decorative Divider */}
      <motion.div 
        variants={isMobile ? mobileItemVariants : itemVariants}
        className="flex items-center justify-center mb-10"
      >
        <div className="h-px w-1/3 bg-gradient-to-r from-transparent to-[#8fbc8f]/60"></div>
        <div className="mx-4 text-[#0A5741] text-lg">✦</div>
        <div className="h-px w-1/3 bg-gradient-to-l from-transparent to-[#8fbc8f]/60"></div>
      </motion.div>
      
      {/* Guests Attire Section */}
      <motion.h3 
        variants={isMobile ? mobileItemVariants : itemVariants}
        className={`text-xl text-[#0A5741] font-medium text-center mb-8 ${cormorant.className}`}
      >
        For Our Cherished Guests
      </motion.h3>
      
      {/* Grid Layout - Guest Attire */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Ladies Section */}
        <motion.div 
          variants={isMobile ? mobileItemVariants : itemVariants}
          className="flex flex-col items-center"
        >
          <h4 className={`text-lg text-[#0A5741] font-medium mb-4 ${cormorant.className}`}>
            Ladies
          </h4>
          <div className="mb-4 w-full overflow-hidden rounded-xl shadow-md group relative">
            <div className="w-full aspect-square relative overflow-hidden bg-white">
              <Image
                src="/attires/guests-ladies-removebg-preview.png"
                alt="Ladies Dress Code"
                fill
                style={{ objectFit: 'contain', objectPosition: 'center' }}
                className="rounded-xl group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A5741]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-medium">Elegant & Graceful</p>
              </div>
            </div>
          </div>
          <p className={`text-center text-[#0A5741] ${cormorant.className}`}>
            Long dress<br />preferably in sage green
          </p>
        </motion.div>
        
        {/* Gentlemen Section */}
        <motion.div 
          variants={isMobile ? mobileItemVariants : itemVariants}
          className="flex flex-col items-center"
        >
          <h4 className={`text-lg text-[#0A5741] font-medium mb-4 ${cormorant.className}`}>
            Gentlemen
          </h4>
          <div className="mb-4 w-full overflow-hidden rounded-xl shadow-md group relative">
            <div className="w-full aspect-square relative overflow-hidden bg-white">
              <Image
                src="/attires/guests-gentleman-attire-removebg-preview.png"
                alt="Gentlemen Dress Code"
                fill
                style={{ objectFit: 'contain', objectPosition: 'center' }}
                className="rounded-xl group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A5741]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-medium">Distinguished & Refined</p>
              </div>
            </div>
          </div>
          <p className={`text-center text-[#0A5741] ${cormorant.className}`}>
            Black formal suit with black slacks<br />with coordinating accessories
          </p>
        </motion.div>
      </div>
      
      {/* Decorative Divider */}
      <motion.div 
        variants={isMobile ? mobileItemVariants : itemVariants}
        className="flex items-center justify-center mb-10"
      >
        <div className="h-px w-1/4 bg-gradient-to-r from-transparent to-[#8fbc8f]/40"></div>
        <div className="mx-4">
          <div className="w-10 h-10 relative">
            <Image 
              src="/card_design/top_flower.webp"
              alt="Floral divider"
              fill
              className="object-contain opacity-40"
            />
          </div>
        </div>
        <div className="h-px w-1/4 bg-gradient-to-l from-transparent to-[#8fbc8f]/40"></div>
      </motion.div>
      
      {/* Principal Sponsors Section */}
      <motion.h3 
        variants={isMobile ? mobileItemVariants : itemVariants}
        className={`text-xl text-[#0A5741] font-medium text-center mb-8 ${cormorant.className}`}
      >
        For Our Principal Sponsors
      </motion.h3>
      
      <div className="grid md:grid-cols-2 gap-12">
        <motion.div 
          variants={isMobile ? mobileItemVariants : itemVariants}
          className="flex flex-col items-center"
        >
          <h4 className={`text-lg text-[#0A5741] font-medium mb-4 ${cormorant.className}`}>
            Ninangs
          </h4>
          <div className="mb-4 w-full overflow-hidden rounded-xl shadow-md group relative">
            <div className="w-full aspect-square relative overflow-hidden bg-white">
              <Image
                src="/attires/sponsor-ladies-attire-removebg-preview.png"
                alt="Principal Sponsors (Female)"
                fill
                style={{ objectFit: 'contain', objectPosition: 'center' }}
                className="rounded-xl group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A5741]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-medium">Grace & Elegance</p>
              </div>
            </div>
          </div>
          <p className={`text-center text-[#0A5741] ${cormorant.className}`}>
            Elegant ankle-length dress<br />in beige
          </p>
        </motion.div>
        
        <motion.div 
          variants={isMobile ? mobileItemVariants : itemVariants}
          className="flex flex-col items-center"
        >
          <h4 className={`text-lg text-[#0A5741] font-medium mb-4 ${cormorant.className}`}>
            Ninongs
          </h4>
          <div className="mb-4 w-full overflow-hidden rounded-xl shadow-md group relative">
            <div className="w-full aspect-square relative overflow-hidden bg-white">
              <Image
                src="/attires/sponsor-gentleman-attire-removebg-preview.png"
                alt="Principal Sponsors (Male)"
                fill
                style={{ objectFit: 'contain', objectPosition: 'center' }}
                className="rounded-xl group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A5741]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-medium">Distinguished & Respected</p>
              </div>
            </div>
          </div>
          <p className={`text-center text-[#0A5741] ${cormorant.className}`}>
            Classic Barong Tagalog with brown slacks
          </p>
        </motion.div>
      </div>
      
      {/* Footer Note */}
      <motion.p 
        variants={isMobile ? mobileItemVariants : itemVariants}
        className={`text-center text-[#0A5741] italic mt-12 ${cormorant.className}`}
      >
        We look forward to celebrating with you in style!
      </motion.p>
    </motion.div>
  );
};

export default EnhancedDressCode;