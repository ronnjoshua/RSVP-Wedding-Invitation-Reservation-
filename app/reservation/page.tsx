"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Import shadcn components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2 } from "lucide-react";

interface GuestInfo {
  full_name: string;
  email: string;
  address: string;
}

interface ReservationData {
  reservation_number: string;
  maxGuests: number;
  guests: number;
  guest_info: GuestInfo[];
  submitted: boolean;
  submittedAt?: Date;
}

interface VerificationResponse {
  control_number: ReservationData;
  submitted: boolean;
  submittedAt: Date | null;
  message?: string;
}

const schema = z.object({
  control_number: z.string().min(1, "Control Number is required"),
});

type ReservationFormInputs = z.infer<typeof schema>;

const Reservation = () => {
  const router = useRouter();
  const [verifiedData, setVerifiedData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeStage, setFadeStage] = useState(0);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch
  } = useForm<ReservationFormInputs>({
    resolver: zodResolver(schema),
  });

  // Watch the control number for empty validation
  const controlNumberValue = watch("control_number");

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setFadeStage(1), 50),
      setTimeout(() => setFadeStage(2), 100),
      setTimeout(() => setFadeStage(3), 150),
      setTimeout(() => setTextAnimationComplete(true), 500), 
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleVerifyControlNumber = async (formData: ReservationFormInputs) => {
  if (!formData.control_number.trim()) {
    setError(null);
    setVerifiedData(null);
    return;
  }
  
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch(`/api/reservations?controlNumber=${formData.control_number}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: VerificationResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Verification failed");
    }

    // Check if reservation is already submitted
    if (data.submitted) {
      setError(data.message || "This reservation has already been submitted");
      setVerifiedData(data);
      return;
    }

    setVerifiedData(data);
    clearErrors("control_number");
    setShowSuccess(true);
    
    // Delay the redirect to show the success animation
    setTimeout(() => {
      router.push(`/reservation/${formData.control_number}`);
    }, 2000);
    
  } catch (err) {
    console.error("Error during verification:", err);
    setError(err instanceof Error ? err.message : "An error occurred");
    setVerifiedData(null);
  } finally {
    setLoading(false);
  }
};

  const getFadeClass = () => {
    switch (fadeStage) {
      case 0: return "opacity-0";
      case 1: return "opacity-25";
      case 2: return "opacity-50";
      default: return "opacity-100";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-green-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`relative w-full max-w-2xl overflow-hidden rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.15)] bg-white ${getFadeClass()} transition duration-500`}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full border-4 border-[#0A5741]"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full border-4 border-[#0A5741]"></div>
        </div>
        
        {/* Top Floral Decoration */}
        <div className="w-full h-64 md:h-72 flex justify-center overflow-hidden">
          <Image
            width={1000}
            height={300}
            src="/card_design/top_flower.webp"
            alt="Lilac flowers"
            className="w-full scale-110 object-cover object-bottom"
            priority
          />
        </div>
        
        {/* Main Content */}
        <form
          onSubmit={handleSubmit(handleVerifyControlNumber)}
          className="w-full flex flex-col px-8 md:px-12 relative z-10 -mt-20"
        >
          <div className="space-y-8 py-8 flex-1 flex flex-col justify-center">
            {/* Heading with Animation */}
            <div className="overflow-hidden">
              <h1 
                className="text-3xl md:text-5xl font-['Great_Vibes',cursive] text-[#0A5741] text-center"
              >
                Confirm Your Attendance
              </h1>
            </div>

            {/* Shadcn Card Component */}
            <AnimatePresence mode="wait">
              {!showSuccess ? (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                >
                  <Card className="border-purple-200/50 shadow-xl overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                      <div className="space-y-6">
                        <div className="text-center">
                          <Label 
                            htmlFor="control_number" 
                            className="text-xl tracking-wide font-['Cormorant_Garamond',serif] text-[#0A5741] uppercase block mb-3"
                          >
                            Control Number
                          </Label>
                          <p className="text-gray-500 text-sm mb-4">
                            Please enter the control number from your invitation
                          </p>
                        </div>

                        <div className="relative">
                          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                            <div className="relative flex-1">
                              <Input
                                id="control_number"
                                {...register("control_number")}
                                className="block w-full rounded-xl border-2 border-purple-200/80 focus:border-[#0A5741] focus:ring-[#0A5741] py-3 text-lg text-[#0A5741] pl-4 pr-10 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-md"
                                placeholder="Enter your control number"
                                disabled={loading}
                                onChange={(e) => {
                                  if (!e.target.value.trim()) {
                                    setError(null);
                                    setVerifiedData(null);
                                  }
                                }}
                              />
                              
                              {/* Status Icon */}
                              {controlNumberValue && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  {loading ? (
                                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                                  ) : error ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <X className="h-5 w-5 text-red-500" />
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-red-50 border-red-200 text-red-700">
                                          <p>{error}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : verifiedData ? (
                                    <Check className="h-5 w-5 text-green-500" />
                                  ) : null}
                                </div>
                              )}
                            </div>
                            
                            <Button
                              type="submit"
                              variant="default"
                              className="bg-[#0A5741] text-white hover:bg-[#0B6B4F] disabled:bg-[#0A5741]/50 rounded-xl py-3 px-6 text-base shadow-sm hover:shadow-lg transition-all duration-300 min-w-[100px]"
                              disabled={loading}
                            >
                              {loading ? (
                                <div className="flex items-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  <span>Verifying</span>
                                </div>
                              ) : "Verify"}
                            </Button>
                          </div>
                          
                          {errors.control_number && (
                            <p className="text-red-500 text-sm mt-2 ml-1">
                              {errors.control_number.message}
                            </p>
                          )}
                        </div>

                        {/* Add this new block */}
                        {(error || verifiedData?.submitted) && (
                          <div className="text-center text-red-600 bg-red-50 p-3 rounded-lg mt-4">
                            <p>{error || "This reservation has already been submitted"}</p>
                            {verifiedData?.submittedAt && (
                              <p className="text-xs text-red-500 mt-1">
                                Submitted on: {new Date(verifiedData.submittedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="text-center text-gray-400 text-xs mt-4">
                          <p>If you don&apos;t have a control number, please contact the couple</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="py-6"
                >
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 shadow-xl overflow-hidden">
                    <CardContent className="p-6 md:p-8 text-center">
                      <div className="relative">
                        {/* Success animation with confetti effect */}
                        <div className="absolute inset-0 overflow-hidden">
                          {[...Array(40)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ 
                                opacity: 0, 
                                top: '50%', 
                                left: '50%',
                                width: Math.random() * 8 + 4, 
                                height: Math.random() * 8 + 4,
                                backgroundColor: ['#0A5741', '#95C5B5', '#D0E2D9', '#F8C7DE'][Math.floor(Math.random() * 4)]
                              }}
                              animate={{ 
                                opacity: [0, 1, 0],
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                y: [0, -(Math.random() * 100 + 50)],
                                x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
                              }}
                              transition={{ 
                                duration: Math.random() * 2 + 1, 
                                delay: Math.random() * 0.5,
                                ease: "easeOut" 
                              }}
                              className="absolute rounded-full"
                            />
                          ))}
                        </div>
                        
                        {/* Success content */}
                        <div className="relative z-10">
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                          >
                            <Check className="h-8 w-8 text-green-600" />
                          </motion.div>
                          
                          <h3 className="text-2xl font-['Great_Vibes',cursive] text-[#0A5741] mb-2">
                            Control Number Verified!
                          </h3>
                          
                          <p className="text-gray-600 mb-6">
                            We&apos;re excited to have you join us on our special day
                          </p>
                          
                          <div className="flex justify-center items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            <span className="text-gray-500 text-sm">Redirecting to reservation form...</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
        
        {/* Bottom Floral Decoration */}
        <div className="w-full h-64 md:h-72 flex justify-center overflow-hidden -mt-10">
          <Image
            width={1000}
            height={300}
            src="/card_design/top_flower.webp"
            alt="Lilac flowers"
            className="w-full scale-110 object-cover object-bottom"
            style={{ transform: 'rotate(180deg)' }}
            priority
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Reservation;