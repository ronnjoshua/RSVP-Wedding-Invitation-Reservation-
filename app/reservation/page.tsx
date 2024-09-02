"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";

const verifyControlNumber = (controlNumber: string) => {
  const mockData: { [key: string]: { name: string; maxGuests: number } } = {
    "123456": { name: "John Doe", maxGuests: 5 },
    "654321": { name: "Jane Smith", maxGuests: 2 },
  };

  return mockData[controlNumber] || null;
};

const schema = z.object({
  control_number: z.string().min(1, "Control Number is required"),
  guests: z.coerce.number().min(1, "At least one guest is required"),
  guest_info: z
    .array(
      z.object({
        full_name: z.string().min(1, "Full name is required"),
        age: z.coerce.number().min(1, "Age must be a positive number"),
        email: z.string().email("Invalid email address"),
        address: z.string().min(1, "Address is required"),
      })
    )
    .min(1, "At least one guest must be entered"),
});

type ReservationFormInputs = z.infer<typeof schema>;

const Reservation = () => {
  const [verifiedData, setVerifiedData] = useState<{
    name: string;
    maxGuests: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    defaultValues: {
      guest_info: [{ full_name: "", age: 0, email: "", address: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "guest_info",
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({ full_name: "", age: 0, email: "", address: "" });
    }
  }, [fields, append]);

  // Multi-step fade-in effect
  useEffect(() => {
    const timeouts = [
      setTimeout(() => setFadeStage(1), 50), // First stage
      setTimeout(() => setFadeStage(2), 100), // Second stage
      setTimeout(() => setFadeStage(3), 150), // Final stage
    ];

    return () => timeouts.forEach(clearTimeout); // Clean up timeouts on unmount
  }, []);

  const onSubmit = (data: ReservationFormInputs) => {
    setFormData(data);
    setIsModalOpen(true);
  };

  const handleVerifyControlNumber = () => {
    const controlNumber = (
      document.getElementById("control_number") as HTMLInputElement
    ).value;
    const data = verifyControlNumber(controlNumber);

    if (data) {
      setVerifiedData(data);
      clearErrors("control_number");
      setValue("guests", 1);
    } else {
      setVerifiedData(null);
      setValue("control_number", "", { shouldValidate: true });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalConfirm = () => {
    if (formData) {
      console.log(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className={`flex items-center justify-center h-screen bg-rose-100`}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`space-y-6 bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-2xl min-h-[900px]  ${
            fadeStage === 0
              ? "opacity-0"
              : fadeStage === 1
              ? "opacity-25"
              : fadeStage === 2
              ? "opacity-50"
              : "opacity-100"
          } overflow-y-auto max-h-[80vh] sm:min-h-[500px] sm:max-w-sm md:min-h-[750px] md:max-w-xl lg:min-h-[800px] lg:max-w-xl small-screen-container`}
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

        {verifiedData && (
          <>
            <div>
              <p className="block text-sm font-medium text-gray-700">
                Name: <span className="font-semibold">{verifiedData.name}</span>
              </p>
              <p className="block text-sm font-medium text-gray-700">
                Maximum Number of Guests: {verifiedData.maxGuests}
              </p>
            </div>

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
                    {...register(`guest_info.${index}.age` as const)}
                    type="number"
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
                    {...register(`guest_info.${index}.email` as const)}
                    type="email"
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
                    className="bg-red-500 text-white hover:bg-red-600 mt-2"
                  >
                    Remove Guest
                  </Button>
                )}
              </div>
            ))}

            {fields.length < (verifiedData?.maxGuests || 0) && (
              <Button
                type="button"
                onClick={() =>
                  append({
                    full_name: "",
                    age: 0,
                    email: "",
                    address: "",
                  })
                }
                className="bg-rose-500 text-white hover:bg-rose-600 mt-4"
              >
                Add Another Guest
              </Button>
            )}

            <div>
              <Button
                type="submit"
                className="bg-rose-500 text-white hover:bg-rose-600 mt-6"
              >
                Submit
              </Button>
            </div>
          </>
        )}
      </form>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title="Confirmation"
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
        >
          <p>Are you sure you want to submit the reservation?</p>
        </Modal>
      )}
    </div>
  );
};

export default Reservation;
