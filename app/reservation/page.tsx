"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { ObjectId } from "mongodb"; // If using MongoDB ObjectId

const verifyControlNumber = async (controlNumber: string) => {
  try {
    const response = await fetch(
      `/api/reservations?controlNumber=${controlNumber}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      } else {
        throw new Error("Error fetching control number");
      }
    }

    const data = await response.json();

    return data || null;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

const isControlNumberValid = async (
  controlNumber: string
): Promise<boolean> => {
  return !!verifyControlNumber(controlNumber);
};

const schema = z.object({
  control_number: z.string().min(1, "Control Number is required"),
//   guests: z.coerce.number().min(1, "At least one guest is required"),
//   guest_info: z.array(
//     z.object({
//       full_name: z.string().min(1, "Full name is required"),
//       age: z
//         .string()
//         .refine((value) => /^\d+$/.test(value), { message: "Age must be a number" })
//         .refine((value) => !/^0\d+$/.test(value), { message: "Age cannot have leading zeros" })
//         .transform((value) => Number(value))
//         .refine((value) => value >= 1, { message: "Age must be a positive number" }),
//       email: z.string().email("Invalid email address"),
//       address: z.string().min(1, "Address is required"),
//     })
//   ).min(1, "At least one guest must be entered"),
// }).refine(async (data) => {
//   const isValid = await isControlNumberValid(data.control_number);
//   return isValid;
}, { message: "Control Number not found" });


type ReservationFormInputs = z.infer<typeof schema>;

interface GuestInfo {
  full_name: string;
  email: string;
  age: number;
  address: string;
}

interface ControlNumberData {
  name: string;
  maxGuests: number;
  guest_info: GuestInfo[];
  guests: number;
  _id: ObjectId; // If using MongoDB ObjectId
}

interface VerifiedData {
  control_number: { [key: string]: ControlNumberData };
}

const Reservation = () => {
  const router = useRouter();
  // Initialize state with the correct type
  const [verifiedData, setVerifiedData] = useState<VerifiedData | null>(null);
  // const [verifiedData, setVerifiedData] = useState<{
  //   control_number: string;
  //   name: string;
  //   maxGuests: number;
  //   guests: number;
  // } | null>(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ReservationFormInputs | null>(null);
  const [fadeStage, setFadeStage] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    clearErrors,
    control,
  } = useForm<ReservationFormInputs>({
    resolver: zodResolver(schema),
    // defaultValues: {
    //   guest_info: [{ full_name: "", age: 0, email: "", address: "" }],
    // },
  });

  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: "guest_info",
  // });

  // useEffect(() => {
  //   if (fields.length === 0) {
  //     append({ full_name: "", age: 0, email: "", address: "" });
  //   }
  // }, [fields, append]);

  useEffect(() => {
    const timeouts = [
      setTimeout(() => setFadeStage(1), 50),
      setTimeout(() => setFadeStage(2), 100),
      setTimeout(() => setFadeStage(3), 150),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const onSubmit = async (data: ReservationFormInputs) => {
    setFormData(data);
    // setIsModalOpen(true);
  };

  // const handleModalConfirm = async () => {
  //   if (formData) {
  //     try {
  //       const response = await fetch("/api/reservations", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(formData),
  //       });

  //       const result = await response.json();
  //       if (response.ok) {
  //         console.log("Reservation successful:", result);
  //         // Handle success here
  //       } else {
  //         console.error("Reservation failed:", result);
  //         // Handle error here
  //       }
  //     } catch (error) {
  //       console.error("Error submitting reservation:", error);
  //     }
  //   }
  //   setIsModalOpen(false);
  // };

  // const handleModalClose = () => {
  //   setIsModalOpen(false);
  // };

  const handleVerifyControlNumber = async () => {
    const controlNumber = (
      document.getElementById("control_number") as HTMLInputElement
    ).value;
    const data = await verifyControlNumber(controlNumber);
    console.log("Fetched Data: ", data);

    if (data) {
      setVerifiedData(data);
      clearErrors("control_number");
      // setValue("guests", 1);

      // Redirect to the dynamic page
      router.push(`/reservation/${controlNumber}`);
    } else {
      setVerifiedData(null);
      setValue("control_number", "", { shouldValidate: true });
    }
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

        {!verifiedData && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Control Number
            </label>
            <div className="flex space-x-2">
              <Input
                id="control_number"
                {...register("control_number")}
                className="mt-1 block w-full"
              />
              <Button
                type="button"
                className="bg-rose-500 text-white hover:bg-rose-600"
                onClick={handleVerifyControlNumber}
              >
                Verify
              </Button>
            </div>
            {errors.control_number && (
              <p className="text-red-500 text-sm mt-1">
                {errors.control_number.message}
              </p>
            )}
          </div>
        )}
        {/* {verifiedData && (
          <>
            <div>
              <p className="block text-sm font-medium text-gray-700">
                Name:{" "}
                <span className="font-semibold">
                  {verifiedData.control_number.name}
                </span>
              </p>
              <p className="block text-sm font-medium text-gray-700">
                Maximum Number of Guests: {verifiedData.control_number.maxGuests}
              </p>
            </div>

            <div className="overflow-y-auto max-h-[60vh] space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="space-y-4">
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

            {fields.length < 5 && (
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
          </>
        )} */}

        {/* {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onConfirm={handleModalConfirm}
            title="Confirm Reservation"
          >
            <p>Are you sure you want to submit this reservation?</p>
          </Modal>
        )} */}
      </form>
    </div>
  );
};

export default Reservation;
