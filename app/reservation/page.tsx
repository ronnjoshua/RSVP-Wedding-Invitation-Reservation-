"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GuestInfo {
  full_name: string;
  email: string;
  address: string;
}

interface ReservationData {
  name: string;
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
    <div className="flex items-center justify-center h-screen bg-purple-100">
      <form
        onSubmit={handleSubmit(handleVerifyControlNumber)}
        className={`space-y-6 bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-2xl 
          ${getFadeClass()} 
          overflow-y-auto max-h-[80vh] 
          sm:min-h-[500px] sm:max-w-sm 
          md:min-h-[750px] md:max-w-xl 
          lg:min-h-[800px] lg:max-w-xl 
          small-screen-container 
          bg-[url('/card_design/2.png')] bg-center bg-cover 
          flex flex-col justify-center`}
      >
        <h1 className="text-3xl font-bold text-purple-400">Reservation Form</h1>

        <div>
          <label className="block text-sm font-medium text-gray-700 border-b-purple-200">
            Control Number
          </label>
          <div className="flex space-x-2">
            <Input
              id="control_number"
              {...register("control_number")}
              className="mt-1 block w-full"
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
              className="bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-300"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
          {errors.control_number && (
            <p className="text-red-500 text-sm mt-1">
              {errors.control_number.message}
            </p>
          )}
          {error && (
            <p className="text-red-500 text-sm mt-1">
              {error}
            </p>
          )}
        </div>

        {verifiedData && !error && (
          <div className="text-green-600 font-medium">
            Control number verified successfully!
          </div>
        )}
      </form>
    </div>
  );
};

export default Reservation;