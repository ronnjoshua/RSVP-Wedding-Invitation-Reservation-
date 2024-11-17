"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}) => {
  const router = useRouter();

  const handleConfirm = () => {
    // Call the onConfirm function passed as a prop
    onConfirm();
    // Redirect to the /confirmation page
    router.push("/confirmation");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black opacity-50"></div>

      {/* Modal container */}
      <div className="bg-white rounded-lg shadow-lg p-6 z-50 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} className="bg-gray-300">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-500 text-white hover:bg-white hover:text-blue-500 border border-blue-500 transition-colors"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
