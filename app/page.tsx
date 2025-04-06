"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Inter, Cormorant_Garamond, Great_Vibes } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Heart, Gift, Music, MoveRight } from 'lucide-react';
// import EnvelopeAnimation from '@/components/EnvelopeAnimation';
import {useRouter} from 'next/navigation';

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

// Page type definitions
type PageType = 'main' | 'calendar' | 'location' | 'reserve';

const EnhancedWeddingInvitation = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showSidePages, setShowSidePages] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('main');
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  // const [showEnvelope, setShowEnvelope] = useState(true);
   const router = useRouter();

  // useEffect(() => {
  //   const checkMobile = () => {
  //     setIsMobile(window.innerWidth <= 768);
  //   };

  //   // Check initially
  //   checkMobile();
  //   window.addEventListener('resize', checkMobile);
    
  //   // Auto-play animation after 2 seconds
  //   const timer = setTimeout(() => {
  //     setShowEnvelope(false);
  //   }, 2000);

  //   return () => {
  //     window.removeEventListener('resize', checkMobile);
  //     clearTimeout(timer);
  //   };
  // }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check initially
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const handleOpenInvitation = () => {
    setIsPressed(true);
    setIsFlipping(true);
    setTimeout(() => {
      setShowSidePages(true);
    }, 800);
  };

  const handleBack = () => {
    setShowSidePages(false);
    setIsFlipping(false);
    setIsPressed(false);
    setCurrentPage('main');
  };

  // Envelope animation
  const envelopeVariants = {
    initial: { scale: 1, opacity: 1 },
    exit: { 
      scale: 1.2, 
      opacity: 0,
      transition: { 
        duration: 1,
        ease: "easeInOut"
      }
    }
  };

  // Front card variants
  const cardVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: isFlipping ? 0 : 1,
      scale: isFlipping ? 0.8 : 1,
      transition: {
        type: "spring",
        stiffness: 45,
        damping: 15,
        mass: 0.5,
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.5,
      }
    }
  };

  const pageTransition = {
    type: "spring",
    stiffness: 45,
    damping: 15,
  };

  // Inner pages animations
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  return (
    <div className={`min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 flex items-center justify-center ${inter.className}`}>
      <style jsx global>{`
        @media (max-width: 768px) {
          :root {
            --flower-header-offset: -150px;
            --flower-footer-offset: -150px;
          }
        }
        @media (min-width: 769px) {
          :root {
            --flower-header-offset: -380px;
            --flower-footer-offset: -400px;
          }
        }
        .card-container {
          perspective: 2000px;
          width: 100%;
          max-width: 2xl;
          position: relative;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .envelope-opening {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
        }
        .envelope-closing {
          clip-path: polygon(50% 40%, 100% 0, 100% 100%, 0 100%, 0 0);
        }
      `}</style>

      <div className="card-container relative">
        <AnimatePresence mode="wait">
          {/* Envelope Animation */}
          {/* {showEnvelope && (
            <motion.div 
              className="absolute inset-0 z-50 flex items-center justify-center"
              variants={envelopeVariants}
              initial="initial"
              exit="exit"
            >
              <div className="relative w-full max-w-2xl aspect-[4/3] bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] rounded-lg shadow-2xl overflow-hidden">
                <div className="absolute inset-0 envelope-closing bg-[#a5d6a7] shadow-inner transform-origin-top"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="w-24 h-24 text-[#0A5741] opacity-50" />
                </div>
              </div>
            </motion.div>
          )} */}
           {/* Enhanced envelope animation */}
        {/* {showEnvelope && (
          <EnvelopeAnimation onOpenComplete={() => setShowEnvelope(false)} />
        )} */}

          {/* Front Card */}
          {!showSidePages && (
            <motion.div 
              key="invitation-card"
              className="relative w-full max-w-2xl mx-auto"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Card className="relative overflow-hidden rounded-3xl shadow-2xl border-0 bg-white">
                {/* Top Flower Decoration */}
                <div className="absolute right-0 w-full overflow-visible z-0">
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
                
                <div className="px-8 py-12">
                  <motion.div 
                    className="text-center space-y-8 mt-24 mb-24 z-10 relative"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, staggerChildren: 0.2 }}
                  >
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className={`text-[#0A5741] text-2xl md:text-3xl tracking-wider font-light ${cormorant.className}`}
                    >
                      SAVE THE DATE
                    </motion.h1>
                    
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <p className={`text-[#0A5741] text-5xl md:text-6xl ${greatVibes.className}`}>
                        Ronn
                      </p>
                      
                      <p className={`text-[#0A5741] text-2xl font-light ${cormorant.className}`}>
                        AND
                      </p>
                      
                      <p className={`text-[#0A5741] text-5xl md:text-6xl ${greatVibes.className}`}>
                        Leinette
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
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
                        GOSHEN HOTEL AND RESORT BAMBAN, TARLAC
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="w-full flex justify-center mt-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className={`rounded-full shadow-lg 
                          bg-[#0A5741] text-white
                          font-semibold whitespace-nowrap
                          transform transition-all duration-300 ease-in-out
                          hover:bg-[#0B6B4F]
                          text-base px-8 py-6
                          ${isPressed ? 'scale-95 opacity-80' : ''}`}
                        onClick={handleOpenInvitation}
                      >
                        <span className="flex items-center gap-2">
                        Join Us in Celebration <MoveRight className="h-4 w-4" />
                        </span>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
                
                {/* Bottom Flower Decoration */}
                <div className="absolute left-0 bottom-0 w-full overflow-visible z-0">
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
              </Card>
            </motion.div>
          )}
          {/* Inner Pages */}
          {showSidePages && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl mx-auto"
            >
              <Card className="bg-white rounded-3xl shadow-2xl overflow-hidden border-0">
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBack}
                      className="text-[#0A5741] border-[#0A5741]"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <h1 className={`text-2xl md:text-3xl text-[#0A5741] text-center ${greatVibes.className}`}>
                      Ronn & Leinette
                    </h1>
                    <div className="w-20"></div> {/* Spacer for alignment */}
                  </div>
                
                  <Tabs defaultValue="details" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 mb-8 bg-[#f8f9fa] p-1 rounded-lg">
                      <TabsTrigger value="details" className="data-[state=active]:bg-[#0A5741] data-[state=active]:text-white">Details</TabsTrigger>
                      <TabsTrigger value="venue" className="data-[state=active]:bg-[#0A5741] data-[state=active]:text-white">Venue</TabsTrigger>
                      <TabsTrigger value="attire" className="data-[state=active]:bg-[#0A5741] data-[state=active]:text-white">Attire</TabsTrigger>
                      <TabsTrigger value="rsvp" className="data-[state=active]:bg-[#0A5741] data-[state=active]:text-white">RSVP</TabsTrigger>
                    </TabsList>
                    
                    <div className="relative overflow-hidden rounded-xl bg-[#f8f9fa]/50 backdrop-blur-sm p-4 min-h-[500px]">
                      {/* Top Flower Overlay */}
                      <div className="absolute top-0 right-0 w-full overflow-hidden opacity-10 pointer-events-none">
                        <Image
                          width={400}
                          height={100}
                          src="/card_design/top_flower.webp"
                          alt="Decorative flower"
                          className="w-full object-contain"
                        />
                      </div>
                      
                      {/* Bottom Flower Overlay */}
                      <div className="absolute bottom-0 right-0 w-full overflow-hidden opacity-10 pointer-events-none transform rotate-180">
                        <Image
                          width={400}
                          height={100}
                          src="/card_design/top_flower.webp"
                          alt="Decorative flower"
                          className="w-full object-contain"
                        />
                      </div>
                    
                      <TabsContent value="details" className="relative z-10">
                        <motion.div
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-8"
                        >
                          <motion.div variants={itemVariants} className="text-center">
                            <h2 className={`text-2xl font-medium text-[#0A5741] mb-4 ${cormorant.className}`}>Wedding Details</h2>
                            <p className={`text-lg text-[#0A5741] ${cormorant.className}`}>
                              Join us for our special day
                            </p>
                          </motion.div>
                          
                          <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center mb-4">
                              <Calendar className="h-5 w-5 text-[#0A5741] mr-2" />
                              <h3 className={`text-xl text-[#0A5741] ${cormorant.className}`}>Date & Time</h3>
                            </div>
                            <div className="pl-7">
                              <p className="text-gray-700 font-medium">Friday, October 24, 2025</p>
                              <p className="text-gray-700">Ceremony: 2:00 PM</p>
                              <p className="text-gray-700">Reception: 4:00 PM</p>
                            </div>
                          </motion.div>

                          <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex flex-col">
                              <div className="text-center mb-4">
                                <h3 className={`text-xl text-[#0A5741] font-medium ${cormorant.className}`}>Our Timeline</h3>
                              </div>
                              <div className="relative pl-8">
                                {/* Timeline line */}
                                <div className="absolute left-3 top-0 h-full w-0.5 bg-[#0A5741]/20"></div>
                                
                                {/* Timeline events */}
                                <div className="relative mb-6">
                                  <div className="absolute left-[-22px] top-1 h-4 w-4 rounded-full bg-[#0A5741]"></div>
                                  <p className="font-medium text-[#0A5741]">2:00 PM</p>
                                  <p className="text-gray-700">Wedding Ceremony</p>
                                </div>
                                
                                <div className="relative mb-6">
                                  <div className="absolute left-[-22px] top-1 h-4 w-4 rounded-full bg-[#0A5741]"></div>
                                  <p className="font-medium text-[#0A5741]">3:00 PM</p>
                                  <p className="text-gray-700">Event Hour</p>
                                </div>
                                
                                <div className="relative mb-6">
                                  <div className="absolute left-[-22px] top-1 h-4 w-4 rounded-full bg-[#0A5741]"></div>
                                  <p className="font-medium text-[#0A5741]">4:00 PM</p>
                                  <p className="text-gray-700">Reception & Dinner</p>
                                </div>
                                
                                <div className="relative">
                                  <div className="absolute left-[-22px] top-1 h-4 w-4 rounded-full bg-[#0A5741]"></div>
                                  <p className="font-medium text-[#0A5741]">7:00 PM</p>
                                  <p className="text-gray-700">Dancing & Celebration</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
                              <Gift className="h-6 w-6 text-[#0A5741] mb-2" />
                              <h3 className={`text-lg text-[#0A5741] ${cormorant.className}`}>Gifts</h3>
                              <p className="text-sm text-gray-700">Your presence is our present, but if you wish to give a gift, we have a registry available.</p>
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
                              <Music className="h-6 w-6 text-[#0A5741] mb-2" />
                              <h3 className={`text-lg text-[#0A5741] ${cormorant.className}`}>Music</h3>
                              <p className="text-sm text-gray-700">Live band and DJ will provide entertainment throughout the evening.</p>
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
                              <Calendar className="h-6 w-6 text-[#0A5741] mb-2" />
                              <h3 className={`text-lg text-[#0A5741] ${cormorant.className}`}>RSVP By</h3>
                              <p className="text-sm text-gray-700">Please respond by September 1, 2025</p>
                            </div>
                          </motion.div>
                        </motion.div>
                      </TabsContent>
                      
                      <TabsContent value="venue" className="relative z-10">
                        <motion.div
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-8"
                        >
                          <motion.div variants={itemVariants} className="text-center mb-6">
                            <h2 className={`text-2xl font-medium text-[#0A5741] mb-2 ${cormorant.className}`}>
                              Goshen Hotel and Resort
                            </h2>
                            <p className={`text-lg text-[#0A5741] ${cormorant.className}`}>
                              Bamban, Tarlac, Philippines
                            </p>
                          </motion.div>
                          
                          <motion.div variants={itemVariants} className="overflow-hidden rounded-xl shadow-md">
                            <div className="aspect-video w-full">
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
                          </motion.div>
                          
                          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                              <h3 className={`text-xl text-[#0A5741] mb-4 ${cormorant.className}`}>About the Venue</h3>
                              <p className="text-gray-700 mb-3">
                                Goshen Hotel and Resort offers a serene and picturesque setting for our special day. Nestled in the heart of Bamban, the venue showcases natural beauty and elegant amenities.
                              </p>
                              <p className="text-gray-700">
                                The ceremony will take place in the Grand Garden, followed by a reception in the Pavilion.
                              </p>
                            </div>
                            
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                              <h3 className={`text-xl text-[#0A5741] mb-4 ${cormorant.className}`}>Getting There</h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-[#0A5741]">By Car</h4>
                                  <p className="text-gray-700 text-sm">1 hour drive from Manila via NLEX</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-[#0A5741]">Shuttle Service</h4>
                                  <p className="text-gray-700 text-sm">Available from designated pickup points</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-[#0A5741]">Parking</h4>
                                  <p className="text-gray-700 text-sm">Complimentary valet parking available</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                          
                          <motion.div variants={itemVariants} className="flex justify-center">
                            <a 
                              href="https://maps.google.com/?q=Goshen+Resort+Bamban+Tarlac"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-6 py-3 bg-[#0A5741] text-white rounded-lg hover:bg-[#0B6B4F] transition-colors"
                            >
                              Get Directions
                            </a>
                          </motion.div>
                        </motion.div>
                      </TabsContent>
                      
                      <TabsContent value="attire" className="relative z-10">
                        <motion.div
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-8"
                        >
                          <motion.div variants={itemVariants} className="text-center">
                            <h2 className={`text-2xl font-medium text-[#0A5741] mb-4 ${cormorant.className}`}>
                              Dress Code & Color Palette
                            </h2>
                            <p className={`text-lg text-[#0A5741] mb-2 ${cormorant.className}`}>
                              We kindly request our guests to follow the dress code below
                            </p>
                          </motion.div>
                          
                          <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-center mb-6">
                              <div className="h-8 w-8 rounded-full bg-[#8fbc8f] mr-2"></div>
                              <div className="h-8 w-8 rounded-full bg-[#f5f5dc] mr-2"></div>
                              <div className="h-8 w-8 rounded-full bg-[#d4af37] mr-2"></div>
                              <p className="text-lg text-[#0A5741] font-medium ml-2">Sage Green • Cream • Gold</p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                <h3 className={`text-lg text-[#0A5741] font-medium ${cormorant.className}`}>
                                  Ladies
                                </h3>
                                <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-md">
                                  <div className="w-full h-full bg-[#f0f0f0] flex items-center justify-center">
                                    <Image
                                      width={250}
                                      height={100}
                                      src="/card_design/dress_code/guests.webp"
                                      alt="Ladies Dress Code"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                                <ul className="space-y-2 text-gray-700">
                                  <li>• Long dress or formal attire</li>
                                  <li>• Preferably in sage green, cream, or gold</li>
                                  <li>• Elegant heels or dressy flats</li>
                                </ul>
                              </div>
                              
                              <div className="space-y-4">
                                <h3 className={`text-lg text-[#0A5741] font-medium ${cormorant.className}`}>
                                  Gentlemen
                                </h3>
                                <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-md">
                                  <div className="w-full h-full bg-[#f0f0f0] flex items-center justify-center">
                                    <Image
                                      width={250}
                                      height={100}
                                      src="/card_design/dress_code/guests.webp"
                                      alt="Gentlemen Dress Code"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                                <ul className="space-y-2 text-gray-700">
                                  <li>• Formal suit or Barong Tagalog</li>
                                  <li>• Coordinating tie or accessories</li>
                                  <li>• Dress shoes</li>
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                          
                          <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className={`text-xl text-[#0A5741] mb-4 text-center ${cormorant.className}`}>
                              For Principal Sponsors
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium text-[#0A5741]">Ninangs</h4>
                                <p className="text-gray-700 mb-2">Elegant floor-length gown in sage green or cream</p>
                                <div className="rounded-lg overflow-hidden shadow-sm">
                                  <Image
                                    width={250}
                                    height={100}
                                    src="/card_design/dress_code/guests.webp"
                                    alt="Principal Sponsors (Female)"
                                    className="w-full h-40 object-cover"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-[#0A5741]">Ninongs</h4>
                                <p className="text-gray-700 mb-2">Classic Barong Tagalog or formal suit</p>
                                <div className="rounded-lg overflow-hidden shadow-sm">
                                  <Image
                                    width={250}
                                    height={100}
                                    src="/card_design/dress_code/guests.webp"
                                    alt="Principal Sponsors (Male)"
                                    className="w-full h-40 object-cover"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      </TabsContent>
                      <TabsContent value="rsvp" className="relative z-10">
                        <motion.div
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-8"
                        >
                          <motion.div variants={itemVariants} className="text-center">
                            <h2 className={`text-2xl font-medium text-[#0A5741] mb-4 ${cormorant.className}`}>
                              Répondez Sil Vous Plaît
                            </h2>
                            <p className={`text-lg text-[#0A5741] mb-6 ${cormorant.className}`}>
                              We would be honored to have you join us on our special day
                            </p>
                          </motion.div>
                          
                          <motion.div variants={itemVariants} className="bg-white rounded-xl p-8 shadow-sm">
                            <div className="text-center mb-6">
                              <h3 className={`text-xl text-[#0A5741] ${cormorant.className}`}>
                                Please submit your RSVP by September 1, 2025
                              </h3>
                            </div>
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
                          </motion.div>
                          
                          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="p-4 border-0 shadow-sm">
                              <h3 className="font-medium text-[#0A5741] mb-2">RSVP Deadline</h3>
                              <p className="text-sm text-gray-600">September 1, 2025</p>
                            </Card>
                            
                            <Card className="p-4 border-0 shadow-sm">
                              <h3 className="font-medium text-[#0A5741] mb-2">Questions?</h3>
                              <p className="text-sm text-gray-600">Email: ronette@example.com</p>
                            </Card>
                            
                            <Card className="p-4 border-0 shadow-sm">
                              <h3 className="font-medium text-[#0A5741] mb-2">Plus Ones</h3>
                              <p className="text-sm text-gray-600">Limited to invitation list only</p>
                            </Card>
                          </motion.div>
                        </motion.div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// We're creating a responsive gallery component with our venue images
const VenueGallery = () => {
  return (
    <Carousel className="w-full max-w-md">
      <CarouselContent>
        <CarouselItem>
          <div className="p-1">
            <div className="overflow-hidden rounded-xl aspect-video bg-[#f0f0f0]">
              <Image
                src="/card_design/venue/venue-1.jpg"
                alt="Venue Image 1"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-center text-sm mt-2">Beautiful garden setup</p>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="p-1">
            <div className="overflow-hidden rounded-xl aspect-video bg-[#f0f0f0]">
              <Image
                src="/card_design/venue/venue-2.jpg"
                alt="Venue Image 2"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-center text-sm mt-2">Reception hall</p>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="p-1">
            <div className="overflow-hidden rounded-xl aspect-video bg-[#f0f0f0]">
              <Image
                src="/card_design/venue/venue-3.jpg"
                alt="Venue Image 3"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-center text-sm mt-2">Ceremony location</p>
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious className="ml-2" />
      <CarouselNext className="mr-2" />
    </Carousel>
  );
};

// Color palette display component
const ColorPalette = () => {
  return (
    <div className="flex justify-center gap-4 my-4">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-[#8fbc8f] border-2 border-white shadow-md"></div>
        <p className="text-xs mt-1 text-gray-700">Sage Green</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-[#f5f5dc] border-2 border-white shadow-md"></div>
        <p className="text-xs mt-1 text-gray-700">Cream</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-[#d4af37] border-2 border-white shadow-md"></div>
        <p className="text-xs mt-1 text-gray-700">Gold</p>
      </div>
    </div>
  );
};

export default EnhancedWeddingInvitation;