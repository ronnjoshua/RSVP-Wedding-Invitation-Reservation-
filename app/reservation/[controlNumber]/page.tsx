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
    }),
  email: z.string().email("Invalid email address"),
  address: z.string().nonempty("Address is required"),
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

   // Fetch the control number data
  //  useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // Ensure controlNumber is not empty and fetch only once
  //       if (controlNumber && !verifiedData) {
  //         const response = await fetch(`/api/reservations/${controlNumber}`);
  //         const result = await response.json();
  
  //         if (response.ok) {
  //           setVerifiedData(result); // Update verifiedData only once
  //         } else {
  //           console.error("Failed to fetch reservation data:", result);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching reservation data:", error);
  //     }
  //   };
  
  //   // Only fetch if controlNumber is set and data hasn't been fetched yet
  //   if (controlNumber && !verifiedData) {
  //     fetchData();
  //   }
  // }, [controlNumber, verifiedData]);

  const onSubmit = async (data: ReservationFormInputs) => {
    setFormData(data);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setFadeStage(1), 50),
      setTimeout(() => setFadeStage(2), 100),
      setTimeout(() => setFadeStage(3), 150),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleModalConfirm = async () => {
    if (formData) {
      try {
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
          // Handle success here
        } else {
          console.error("Reservation failed:", result);
          // Handle error here
        }
      } catch (error) {
        console.error("Error submitting reservation:", error);
      }
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={`flex items-center justify-center h-screen bg-rose-100`}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`space-y-6 bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-2xl min-h-[900px]${
          fadeStage === 0
            ? "opacity-0"
            : fadeStage === 1
            ? "opacity-25"
            : fadeStage === 2
            ? "opacity-50"
            : "opacity-100"
        } overflow-y-auto max-h-[80vh] sm:min-h-[500px] sm:max-w-sm md:min-h-[750px] md:max-w-xl lg:min-h-[800px] lg:max-w-xl small-screen-container bg-[url('/card_design/2.png')] bg-center bg-cover flex flex-col justify-center`}
      >
        <h1 className="text-3xl font-bold text-rose-600">Reservation Form</h1>
        <div>
          <p className="block text-sm font-medium text-gray-700">
            Name: <span className="font-semibold">{verifiedData?.reservation_number || 'Loading...'}</span>
          </p>
          <p className="block text-sm font-medium text-gray-700">
            Maximum Number of Guests: <span className="font-semibold">{verifiedData?.maxGuests || 'Loading...'}</span>
          </p>
        </div>

        <div className="overflow-y-auto max-h-[60vh] space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Guest {index + 1}
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  {...register(`guest_info.${index}.full_name` as const)}
                  className="mt-1 block w-full"
                />
                {errors.guest_info?.[index]?.full_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.guest_info[index]?.full_name?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <Input
                  type="number"
                  {...register(`guest_info.${index}.age` as const)}
                  className="mt-1 block w-full"
                />
                {errors.guest_info?.[index]?.age && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.guest_info[index]?.age?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  {...register(`guest_info.${index}.email` as const)}
                  className="mt-1 block w-full"
                />
                {errors.guest_info?.[index]?.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.guest_info[index]?.email?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <Input
                  {...register(`guest_info.${index}.address` as const)}
                  className="mt-1 block w-full"
                />
                {errors.guest_info?.[index]?.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.guest_info[index]?.address?.message}
                  </p>
                )}
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Remove Guest
                </Button>
              )}
            </div>
          ))}
        </div>

        {verifiedData && fields.length < verifiedData.maxGuests && (
          <Button
            type="button"
            onClick={() =>
              append({ full_name: "", age: 0, email: "", address: "" })
            }
            className="bg-rose-500 text-white hover:bg-rose-600"
          >
            Add Another Guest
          </Button>
        )}

        <Button
          type="submit"
          className="bg-red-500 text-white hover:bg-red-600"
        >
          Submit Reservation
        </Button>

        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onConfirm={handleModalConfirm}
            title="Confirm Reservation"
          >
            <p>Are you sure you want to submit this reservation?</p>
          </Modal>
        )}
      </form>
    </div>
  );
};

export default ReservationPage;
