"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Inter, Cormorant_Garamond, Great_Vibes } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';

// Font configurations
const inter = Inter({ subsets: ['latin'] });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
});
const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
});

// Add navigation helper functions
type PageType = 'main' | 'calendar' | 'location' | 'reserve';

const getNextPage = (currentPage: PageType): PageType | 'front' => {
  switch (currentPage) {
    case 'main':
      return 'calendar';
    case 'calendar':
      return 'location';
    case 'location':
      return 'reserve';
    case 'reserve':
      return 'front'; // Return to front card instead of main
  }
};


const getPreviousPage = (currentPage: PageType): PageType | 'front' => {
  switch (currentPage) {
    case 'main':
      return 'front'; // Return to front card
    case 'reserve':
      return 'location';
    case 'location':
      return 'calendar';
    case 'calendar':
      return 'main';
  }
};

const WeddingInvitation = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showSidePages, setShowSidePages] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('main');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // 768px is standard mobile breakpoint
    };

    // Check initially
    checkMobile();

    // Add listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only handle swipes if on mobile
    if (!isMobile) return;
    
    const SWIPE_THRESHOLD = 50;
    
    if (Math.abs(info.offset.x) < SWIPE_THRESHOLD) return;
    
    if (info.offset.x > SWIPE_THRESHOLD) {
      if (currentPage !== 'main') {
        handleNavigation('previous');
      }
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      if (currentPage !== 'reserve') {
        handleNavigation('next');
      }
    }
  };

  const handleNavigation = (direction: 'next' | 'previous') => {
    const nextPage = direction === 'next' 
      ? getNextPage(currentPage)
      : getPreviousPage(currentPage);
  
    if (nextPage === 'front') {
      // Handle return to front card
      handleBack();
    } else {
      setCurrentPage(nextPage as PageType);
    }
  };
  

  const handleReservationClick = () => {
    setIsPressed(true);
    setIsFlipping(true);
    setTimeout(() => {
      setShowSidePages(true);
    }, 800);
  };

  const handleBack = () => {
    const timeline = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowSidePages(false);
      setIsFlipping(false);
      setIsPressed(false);
      setCurrentPage('main');
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

  const renderMainPages = (): JSX.Element => (
    <div className="relative w-full perspective-[2000px]">
      <div className="relative book-pages-container flex md:flex-row flex-col justify-center items-stretch min-h-[750px] md:min-h-[850px] gap-4 md:gap-0">
        {/* Left Page Container */}
        <motion.div
          className="w-full max-w-2xl book-page-left flex"
          initial={{ 
            rotateY: 180,
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
          {...(isMobile ? {
            drag: "x",
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0.2,
            onDragEnd: handleDragEnd,
            dragMomentum: false,
          } : {})}
        >
          <div className="w-full bg-white rounded-l-3xl shadow-2xl px-8 py-12 relative overflow-hidden flex-1">
            {/* Flower Overlays */}
            <div className="absolute inset-0 pointer-events-none">
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
            rotateY: -180,
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
          {...(isMobile ? {
            drag: "x",
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0.2,
            onDragEnd: handleDragEnd,
            dragMomentum: false,
          } : {})}
        >
          <div className="w-full bg-white rounded-r-3xl shadow-2xl px-8 py-12 relative overflow-hidden flex-1">
            {/* Flower Overlays */}
            <div className="absolute inset-0 pointer-events-none">
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
              







              
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderCalendarPage = (): JSX.Element => (
    <div className="relative w-full perspective-[2000px]">
      <div className="relative book-pages-container flex md:flex-row flex-col justify-center items-stretch min-h-[750px] md:min-h-[850px] gap-4 md:gap-0">
        {/* Left Page - Calendar */}
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
          {...(isMobile ? {
            drag: "x",
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0.2,
            onDragEnd: handleDragEnd,
            dragMomentum: false,
          } : {})}
        >
          <div className="w-full bg-white rounded-l-3xl shadow-2xl px-8 py-12 relative overflow-hidden flex-1">
            {/* Flower Overlays */}
            <div className="absolute inset-0 pointer-events-none">
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
              <div className={`text-center space-y-8 mt-24 mb-24 ${cormorant.className}`}>
                <h2 className="text-[#0A5741] text-3xl font-light mb-12">When</h2>
                
                {/* Calendar Section */}
                <div className="mb-12 p-4 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-200">
                  <div className="calendar-container bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="calendar-header bg-[#0A5741] text-white p-2 flex justify-between items-center">
                      <span className="text-xl font-semibold tracking-wide">October 2025</span>
                    </div>
                    <div className="calendar-body p-2">
                      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
                        <div>SUN</div>
                        <div>MON</div>
                        <div>TUE</div>
                        <div>WED</div>
                        <div>THU</div>
                        <div>FRI</div>
                        <div>SAT</div>
                      </div>
                      <div className="grid grid-cols-7 text-center gap-1">
                        {[...Array(31)].map((_, index) => {
                          const day = index + 1;
                          return (
                            <div 
                              key={day} 
                              className={`p-2 rounded-lg ${
                                day === 25 
                                  ? 'bg-[#0A5741] text-white font-bold' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="event-details mt-5 bg-[#F1F3F4] rounded-lg p-4 border border-gray-200 text-center">
                    <div className="flex flex-col items-center">
                      <div>
                        <p className="text-[#0A5741] text-xl font-semibold tracking-wide">Our Wedding Day</p>
                        <p className="text-gray-600 text-base">Friday, October 25, 2025 at 2:00 PM</p>
                        <p className="text-gray-500 text-sm mt-1">Goshen Hotel and Resort, Bamban, Tarlac</p>
                      </div>
                    </div>
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

        {/* Right Page - Venue */}
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
          {...(isMobile ? {
            drag: "x",
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0.2,
            onDragEnd: handleDragEnd,
            dragMomentum: false,
          } : {})}
        >
          <div className="w-full bg-white rounded-r-3xl shadow-2xl px-8 py-12 relative overflow-hidden flex-1">
            {/* Flower Overlays */}
            <div className="absolute inset-0 pointer-events-none">
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
              <div className={`text-center space-y-8 mt-24 mb-24 ${cormorant.className}`}>
                <h2 className="text-[#0A5741] text-3xl font-light mb-12">Where</h2>
                
                {/* Location Section */}
                <div className="p-6 bg-white/80 backdrop-blur rounded-xl shadow-md">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <MapPin className="w-6 h-6 text-[#0A5741]" />
                    <h3 className="text-[#0A5741] text-xl font-medium">Venue</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[#0A5741] text-lg">Goshen Hotel and Resort</p>
                    <p className="text-[#0A5741] text-lg">Bamban, Tarlac, Philippines</p>
                    <a 
                      // href="https://maps.google.com/?q=Goshen+Resort+Bamban+Tarlac"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 px-6 py-2 bg-[#0A5741] text-white rounded-full hover:bg-[#0B6B4F] transition-colors"
                      onClick={() => setCurrentPage('location')}
                    >
                      View Venue
                    </a>
                  </div>
                </div>


                <div className="text-[#0A5741] text-lg space-y-4">
                  <p>Join us for this momentous occasion</p>
                  <p>as we celebrate our love and commitment</p>
                  <p>in the presence of family and friends.</p>
                </div>


              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const LocationPage = (): JSX.Element => (
    <div className="relative w-full perspective-[2000px]">
      <div className="relative book-pages-container flex md:flex-row flex-col justify-center items-stretch min-h-[750px] md:min-h-[850px] gap-4 md:gap-0">
        {/* Left Page - Venue Details */}
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
          {...(isMobile ? {
            drag: "x",
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0.2,
            onDragEnd: handleDragEnd,
            dragMomentum: false,
          } : {})}
        >
          <div className="w-full bg-white rounded-l-3xl shadow-2xl px-8 py-12 relative overflow-hidden flex-1">
            {/* Flower Overlays */}
            <div className="absolute inset-0 pointer-events-none">
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
              <div className={`text-center space-y-8 mt-24 mb-24 ${cormorant.className}`}>
                <h2 className="text-[#0A5741] text-3xl font-light mb-12">The Venue</h2>
                
                <div className="p-6 bg-white/80 backdrop-blur rounded-xl shadow-md">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <MapPin className="w-6 h-6 text-[#0A5741]" />
                    <h3 className="text-[#0A5741] text-xl font-medium">Goshen Hotel and Resort</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[#0A5741] text-lg">
                      A beautiful venue nestled in the heart of Bamban, Tarlac
                    </p>
                    <p className="text-[#0A5741] text-lg">
                      Known for its serene atmosphere and elegant amenities
                    </p>
                    <p className="text-[#0A5741] text-lg">
                      Perfect for creating lasting memories on our special day
                    </p>
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

        {/* Right Page - Map */}
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
          {...(isMobile ? {
            drag: "x",
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0.2,
            onDragEnd: handleDragEnd,
            dragMomentum: false,
          } : {})}
        >
          <div className="w-full bg-white rounded-r-3xl shadow-2xl px-8 py-12 relative overflow-hidden flex-1">
            {/* Flower Overlays */}
            <div className="absolute inset-0 pointer-events-none">
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
              <div className={`text-center space-y-8 mt-24 mb-24 ${cormorant.className}`}>
                <h2 className="text-[#0A5741] text-3xl font-light mb-12">Location</h2>
                
                {/* Location Section */}
                <div className="p-6 bg-white/80 backdrop-blur rounded-xl shadow-md">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <MapPin className="w-6 h-6 text-[#0A5741]" />
                    <h3 className="text-[#0A5741] text-xl font-medium">Find Us Here</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[#0A5741] text-lg">
                      Bamban, Tarlac, Philippines
                    </p>
                    <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3853.8046719700647!2d120.5508!3d15.4567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDI3JzI0LjEiTiAxMjDCsDMzJzAyLjkiRQ!5e0!3m2!1sen!2sph!4v1650000000000!5m2!1sen!2sph"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <div className="space-y-4 mt-4">
                      <a 
                        href="https://maps.google.com/?q=Goshen+Resort+Bamban+Tarlac"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-2 bg-[#0A5741] text-white rounded-full hover:bg-[#0B6B4F] transition-colors"
                      >
                        Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const ReservePage = (): JSX.Element => (
    <div className="relative w-full perspective-[2000px]">
      <div className="relative book-pages-container flex md:flex-row flex-col justify-center items-stretch min-h-[750px] md:min-h-[850px] gap-4 md:gap-0">
        {/* Left Page - Venue Details */}
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
          {...(isMobile ? {
            drag: "x",
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0.2,
            onDragEnd: handleDragEnd,
            dragMomentum: false,
          } : {})}
        >
          <div className="w-full bg-white rounded-l-3xl shadow-2xl px-8 py-12 relative overflow-hidden flex-1">
            {/* Flower Overlays */}
            <div className="absolute inset-0 pointer-events-none">
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
                <h2 className="text-[#0A5741] text-3xl font-light"></h2>
                <div className="space-y-6">
                  <p className="text-[#0A5741] text-lg">
                   
                  </p>

               
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

        {/* Right Page - Map */}
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
          {...(isMobile ? {
            drag: "x",
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0.2,
            onDragEnd: handleDragEnd,
            dragMomentum: false,
          } : {})}
        >
          <div className="w-full bg-white rounded-r-3xl shadow-2xl px-8 py-12 relative overflow-hidden flex-1">
            {/* Flower Overlays */}
            <div className="absolute inset-0 pointer-events-none">
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
  );

  return (
    <div className={`min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 flex items-center justify-center ${inter.className}`}>
      <style jsx global>{`
        @media (max-width: 768px) {
          :root {
            --flower-header-offset: -150px;
            --flower-footer-offset: -150px;
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
            --flower-header-offset: -380px;
            --flower-footer-offset: -400px;
            --sidepage-flower-header-offset: -320px;
            --sidepage-flower-footer-offset: -330px;
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

        .shadow-3d {
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
            </motion.div>
          )}
  
          {/* Navigation */}
          {showSidePages && (
            <>
              {/* Show back button that returns to front card only on details page */}
              {currentPage === 'main' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 flex items-center h-full"
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

              {/* Show regular navigation back button for other pages except main */}
              {currentPage !== 'main' &&  (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 flex items-center h-full"
                >
                  <Button
                    variant="ghost"
                    className="rounded-full p-3 hover:bg-[#0A5741] hover:text-white transition-colors"
                    onClick={() => handleNavigation('previous')}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                </motion.div>
              )}

              {/* Only show next button if not on reserve page */}
              {currentPage !== 'reserve' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 flex items-center h-full"
                >
                  <Button
                    variant="ghost"
                    className="rounded-full p-3 hover:bg-[#0A5741] hover:text-white transition-colors"
                    onClick={() => handleNavigation('next')}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </motion.div>
              )}
            </>
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
                <AnimatePresence mode="wait">
                  {currentPage === 'main' && renderMainPages()}
                  {currentPage === 'calendar' && renderCalendarPage()}
                  {currentPage === 'location' && <LocationPage />}
                  {currentPage === 'reserve' && <ReservePage />}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };
  
  export default WeddingInvitation;