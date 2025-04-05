// app/reservation/[controlNumber]/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input"; // Adjust path as needed
import { Button } from "@/components/ui/button"; // Adjust path as needed
import Modal from "@/components/ui/modal";
import Image from "next/image";
import { ObjectId } from "mongodb"; // If using MongoDB ObjectId

// Define your Zod schema
const guestSchema = z.object({
  full_name: z.string().nonempty("Full Name is required"),
  age: z
    .string()
    .refine((value) => /^\d+$/.test(value), { message: "Age must be a number" })
    .refine((value) => !/^0\d+$/.test(value), {
      message: "Age cannot have leading zeros",
    })
    .transform((value) => Number(value))
    .refine((value) => value >= 1, {
      message: "Age must be a positive number",
    })
    .refine((value) => value > 7, {
      message: "Age must be greater than 7",
    }),
  email: z.string(),
  address: z.string(),
});

const schema = z.object({
  guest_info: z.array(guestSchema),
});

type FormValues = z.infer<typeof schema>;
type ReservationFormInputs = z.infer<typeof schema>;

interface GuestInfo {
  full_name: string;
  email: string;
  age: number;
  address: string;
}

interface ControlNumberData {
  reservation_number: string;
  maxGuests: number;
  guest_info: GuestInfo[];
  guests: number;
  _id: ObjectId; // If using MongoDB ObjectId
}

interface VerifiedData {
  control_number: { [key: string]: ControlNumberData };
}

const ReservationPage = ({ params }: { params: { controlNumber: string } }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fadeStage, setFadeStage] = useState(0);
  const [formData, setFormData] = useState<ReservationFormInputs | null>(null);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);

  // Add these lines here ↓
  const [verifiedData, setVerifiedData] = useState<ControlNumberData | null>(null);
  const { controlNumber } = params;

  // Add the useEffect here ↓
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (controlNumber) {
          const response = await fetch(`/api/reservations/${controlNumber}`);
          const result = await response.json();
          
          if (response.ok) {
            setVerifiedData(result.control_number[controlNumber]);
          } else {
            console.error("Failed to fetch reservation data:", result);
          }
        }
      } catch (error) {
        console.error("Error fetching reservation data:", error);
      }
    };
    fetchData();
  }, [controlNumber]);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      guest_info: [{ full_name: "", age: 0, email: "", address: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "guest_info",
  });
  const router = useRouter();

  const onSubmit = async (data: ReservationFormInputs) => {
    setFormData(data);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setFadeStage(1), 50),
      setTimeout(() => setFadeStage(2), 100),
      setTimeout(() => setFadeStage(3), 150),
      setTimeout(() => setTextAnimationComplete(true), 500),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleModalConfirm = async () => {
    if (formData) {
      try {
        console.log("Submitting reservation data:", formData);
        
        const response = await fetch(`/api/reservations/${params.controlNumber}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (response.ok) {
          console.log("Reservation successful:", result);
          // Handle success here - redirect to confirmation page
          router.push("/confirmation");
        } else {
          console.error("Reservation failed:", result);
          // Handle error here
          alert("Failed to submit reservation: " + (result.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error submitting reservation:", error);
        alert("Error submitting reservation. Please try again.");
      }
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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
    <div className="flex items-center justify-center min-h-screen py-4 bg-gradient-to-br from-purple-50 to-green-50">
<div 
  className={`relative w-full max-w-2xl mx-4 overflow-hidden rounded-3xl shadow-lg bg-white ${getFadeClass()} transition duration-500`}
>
        {/* Top Lilac Flower Decoration */}
        <div className="absolute top-0 left-0 w-full h-64 md:h-72 flex justify-center overflow-hidden z-0">
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
    onSubmit={handleSubmit(onSubmit)}
    className="w-full flex flex-col px-8 md:px-12 pt-16 pb-16 z-10 relative"
    style= {{marginTop: '20%', marginBottom: '-5%'}}
  >
          <div className="space-y-6 py-4 flex-1 flex flex-col justify-center">
            <div className="overflow-hidden">
              <h1 
                className={`text-3xl md:text-5xl font-['Great_Vibes',cursive] text-[#0A5741] text-center
                  transition-all duration-1000 ease-out delay-500
                  ${textAnimationComplete ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
              >
                Guest Information
              </h1>
            </div>

            <div 
              className={`bg-white/90 p-6 md:p-8 rounded-2xl shadow-sm border border-purple-200
                transition-all duration-1000 ease-in-out delay-800
                ${textAnimationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              <div className="mb-6 text-center">
                <p className="text-lg font-['Cormorant_Garamond',serif] text-[#0A5741]">
                  Reservation: <span className="font-semibold">{verifiedData?.reservation_number || 'Loading...'}</span>
                </p>
                <p className="text-lg font-['Cormorant_Garamond',serif] text-[#0A5741]">
                  Maximum Guests: <span className="font-semibold">{verifiedData?.maxGuests || 'Loading...'}</span>
                </p>
              </div>

              <div className="overflow-y-auto max-h-[40vh] space-y-4 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent pr-1">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 p-3 bg-white/80 rounded-xl border border-purple-100">
                    <h2 className="text-xl font-['Cormorant_Garamond',serif] text-[#0A5741] text-center uppercase tracking-wide">
                      Guest {index + 1}
                    </h2>
                    <div>
                      <label className="block text-lg font-['Cormorant_Garamond',serif] text-[#0A5741]">
                        Full Name
                      </label>
                      <Input
                        {...register(`guest_info.${index}.full_name` as const)}
                        className="mt-1 block w-full rounded-xl border-2 border-purple-200 focus:border-[#0A5741] focus:ring-[#0A5741] py-2 text-[#0A5741]"
                      />
                      {errors.guest_info?.[index]?.full_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.guest_info[index]?.full_name?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-lg font-['Cormorant_Garamond',serif] text-[#0A5741]">
                        Age
                      </label>
                      <Input
                        type="number"
                        {...register(`guest_info.${index}.age` as const)}
                        className="mt-1 block w-full rounded-xl border-2 border-purple-200 focus:border-[#0A5741] focus:ring-[#0A5741] py-2 text-[#0A5741]"
                      />
                      {errors.guest_info?.[index]?.age && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.guest_info[index]?.age?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-lg font-['Cormorant_Garamond',serif] text-[#0A5741]">
                        Email
                      </label>
                      <Input
                        type="email"
                        {...register(`guest_info.${index}.email` as const)}
                        className="mt-1 block w-full rounded-xl border-2 border-purple-200 focus:border-[#0A5741] focus:ring-[#0A5741] py-2 text-[#0A5741]"
                      />
                      {errors.guest_info?.[index]?.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.guest_info[index]?.email?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-lg font-['Cormorant_Garamond',serif] text-[#0A5741]">
                        Address
                      </label>
                      <Input
                        {...register(`guest_info.${index}.address` as const)}
                        className="mt-1 block w-full rounded-xl border-2 border-purple-200 focus:border-[#0A5741] focus:ring-[#0A5741] py-2 text-[#0A5741]"
                      />
                      {errors.guest_info?.[index]?.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.guest_info[index]?.address?.message}
                        </p>
                      )}
                    </div>
                    {fields.length > 1 && (
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          className="bg-red-400 text-white hover:bg-red-500 disabled:bg-red-300 rounded-xl py-2 px-4"
                        >
                          Remove Guest
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                {verifiedData && fields.length < verifiedData.maxGuests && (
                  <Button
                    type="button"
                    onClick={() =>
                      append({ full_name: "", age: 0, email: "", address: "" })
                    }
                    className="bg-purple-400 text-white hover:bg-purple-500 disabled:bg-purple-300 rounded-xl py-2 px-4"
                  >
                    Add Another Guest
                  </Button>
                )}

                <Button
                  type="submit"
                  className="bg-[#0A5741] text-white hover:bg-[#0A5741]/90 disabled:bg-[#0A5741]/50 rounded-xl py-2 px-6"
                >
                  Submit Reservation
                </Button>
              </div>
            </div>
          </div>
        </form>
        
        {/* Bottom Lilac Flower Decoration */}
        <div className="absolute bottom-0 left-0 w-full h-64 md:h-72 flex justify-center overflow-hidden z-0">
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

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          title="Confirm Reservation"
        >
          <p className="text-[#0A5741] text-center">Are you sure you want to submit this reservation?</p>
        </Modal>
      )}
    </div>
  );
};

export default ReservationPage;