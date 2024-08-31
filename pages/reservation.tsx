'use client'
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal"; // Import the Modal component

const verifyControlNumber = (controlNumber: string) => {
  const mockData: {
    [key: string]: { name: string; maxGuests: number };
  } = {
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

  const onSubmit = (data: ReservationFormInputs) => {
    setFormData(data);
    setIsModalOpen(true); // Open the modal on form submit
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

  const handleGuestsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGuests = parseInt(event.target.value);
    setValue("guests", selectedGuests);

    if (selectedGuests > fields.length) {
      for (let i = fields.length; i < selectedGuests; i++) {
        append({ full_name: "", age: 0, email: "", address: "" });
      }
    } else if (selectedGuests < fields.length) {
      for (let i = fields.length; i > selectedGuests; i--) {
        remove(i - 1);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalConfirm = () => {
    if (formData) {
      console.log(formData);
      // Handle form submission, e.g., send to API
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold">Reservation Form</h1>

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
              <Button type="button" onClick={handleVerifyControlNumber}>
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
                Name: {verifiedData.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Guests
              </label>
              <select
                {...register("guests")}
                onChange={handleGuestsChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                {[...Array(verifiedData.maxGuests)].map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
              {errors.guests && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.guests.message}
                </p>
              )}
            </div>

            {fields.map((field, index) => (
              <div key={index}>
                <h2 className="text-lg font-semibold">Guest {index + 1}</h2>
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
              </div>
            ))}
            <Button type="submit" className="w-full mt-4">
              Submit
            </Button>
          </>
        )}
      </form>
{/* 
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title="Confirm Submission"
      >
        <p>Are you sure you want to submit this reservation form?</p>
      </Modal> */}
    </div>
  );
};

export default Reservation;
