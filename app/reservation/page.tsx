"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    clearErrors,
  } = useForm<ReservationFormInputs>({
    resolver: zodResolver(schema),
  });

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
    // If the control number is empty, clear the error and return early
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
  
      const data = await response.json();
  
      if (!response.ok) {
        // Display the exact error message from the server
        throw new Error(data.message);
      }
  
      if (data.submitted) {
        setError("This reservation has already been submitted");
        return;
      }
  
      setVerifiedData(data);
      clearErrors("control_number");
      
      router.push(`/reservation/${formData.control_number}`);
      
    } catch (err) {
      console.error("Error during verification:", err);
      // Display the actual error message instead of the default one
      setError(err instanceof Error ? err.message : "An error occurred");
      setVerifiedData(null);
      // Don't clear the control number when it's not found
      // Remove this line: setValue("control_number", "", { shouldValidate: true });
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
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-green-50">
      <div 
        className={`relative w-full max-w-2xl mx-4 overflow-hidden rounded-3xl shadow-lg bg-white ${getFadeClass()} transition duration-500`}
      >
        {/* Top Lilac Flower Decoration */}
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
        
        <form
          onSubmit={handleSubmit(handleVerifyControlNumber)}
          className="w-full flex flex-col px-8 md:px-12"
        >
          <div className="space-y-8 py-8 flex-1 flex flex-col justify-center">
            <div className="overflow-hidden">
              <h1 
                className={`text-3xl md:text-5xl font-['Great_Vibes',cursive] text-[#0A5741] text-center
                  transition-all duration-1000 ease-out delay-500
                  ${textAnimationComplete ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
              >
                Confirm Your Attendance
              </h1>
            </div>

            <div 
              className={`bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-purple-200
                transition-all duration-1000 ease-in-out delay-800
                ${textAnimationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              <label className="block text-xl tracking-wide font-['Cormorant_Garamond',serif] text-[#0A5741] mb-3 uppercase text-center">
                Control Number
              </label>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Input
                  id="control_number"
                  {...register("control_number")}
                  className="block w-full rounded-xl border-2 border-purple-200 focus:border-[#0A5741] focus:ring-[#0A5741] py-3 text-lg text-[#0A5741]"
                  disabled={loading}
                  onChange={(e) => {
                    if (!e.target.value.trim()) {
                      setError(null);
                      setVerifiedData(null);
                    }
                  }}
                />
                <Button
                  type="submit"
                  className="bg-[#0A5741] text-white hover:bg-[#0A5741]/90 disabled:bg-[#0A5741]/50 rounded-xl py-3 px-6 text-base"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </div>
              {errors.control_number && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {errors.control_number.message}
                </p>
              )}
              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {error}
                </p>
              )}
            </div>

            {verifiedData && !error && (
              <div className="text-green-600 font-medium bg-white p-4 rounded-xl text-center font-['Great_Vibes',cursive] text-xl">
                Control number verified successfully!
              </div>
            )}
          </div>
        </form>
        
        {/* Bottom Lilac Flower Decoration */}
        <div className="w-full h-64 md:h-72 flex justify-center overflow-hidden">
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
      </div>
    </div>
  );
};

export default Reservation;