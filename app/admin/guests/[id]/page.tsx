"use client"
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Save, 
  ArrowLeft, 
  Trash, 
  PlusCircle, 
  MinusCircle 
} from "lucide-react";

// Interfaces to match GuestModel.ts
interface GuestInfo {
  full_name: string;
  age: number;
  email?: string;
  address: string;
}

interface ControlNumberData {
  reservation_number: string;
  maxGuests: number;
  guests: number;
  guest_info: GuestInfo[];
  submitted?: boolean;
  submittedAt?: Date;
}

interface Guest {
  _id?: string;
  control_number: {
    [key: string]: ControlNumberData;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function GuestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const controlParam = searchParams ? searchParams.get('control') : null;
  
  const isNew = params.id === "new";
  const guestId = isNew ? null : params.id;
  
  const [guest, setGuest] = useState<Guest>({
    control_number: {
      "": {
        reservation_number: "",
        maxGuests: 1,
        guests: 1,
        guest_info: [
          {
            full_name: "",
            age: 18,
            email: "",
            address: ""
          }
        ]
      }
    }
  });
  
  const [activeControlNumber, setActiveControlNumber] = useState<string>("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch guest data if editing
  useEffect(() => {
    const fetchGuest = async () => {
      if (isNew) return;
      
      try {
        console.log(`Fetching guest with ID: ${guestId}`);
        const token = localStorage.getItem("adminToken");
        
        if (!token) {
          console.log("No admin token found");
          router.push("/admin/login");
          return;
        }
        
        // Updated URL to match your API structure
        const url = controlParam 
          ? `/api/guests/${guestId}?control=${controlParam}`
          : `/api/guests/${guestId}`;
          
        console.log(`Fetching from: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        console.log("Response status:", response.status);
        
        if (response.status === 401) {
          console.log("Unauthorized - redirecting to login");
          localStorage.removeItem("adminToken");
          router.push("/admin/login");
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch guest: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Received guest data:", data);
        setGuest(data);
        
        // Set active control number from URL param or use the first one
        const controlKeys = Object.keys(data.control_number);
        console.log("Control keys:", controlKeys);
        if (controlParam && controlKeys.includes(controlParam)) {
          setActiveControlNumber(controlParam);
        } else if (controlKeys.length > 0) {
          setActiveControlNumber(controlKeys[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load guest");
        console.error("Error fetching guest:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuest();
  }, [guestId, isNew, router, controlParam]);

  // For new guests, initialize with an empty control number
  useEffect(() => {
    if (isNew) {
      const newControlNumber = generateControlNumber();
      setActiveControlNumber(newControlNumber);
      setGuest({
        control_number: {
          [newControlNumber]: {
            reservation_number: generateReservationNumber(),
            maxGuests: 1,
            guests: 1,
            guest_info: [
              {
                full_name: "",
                age: 18,
                email: "",
                address: ""
              }
            ]
          }
        }
      });
      setLoading(false);
    }
  }, [isNew]);

  // Generate a new control number
  const generateControlNumber = () => {
    return `CN${Math.floor(100000 + Math.random() * 900000)}`;
  };

  // Generate a reservation number
  const generateReservationNumber = () => {
    return `RN${Math.floor(100000 + Math.random() * 900000)}`;
  };

  // Handle form input changes for control number info
  const handleControlNumberChange = (field: keyof ControlNumberData, value: any) => {
    if (!activeControlNumber) return;
    
    const updated = { ...guest };
    if (!updated.control_number[activeControlNumber]) return;
    
    updated.control_number[activeControlNumber] = {
      ...updated.control_number[activeControlNumber],
      [field]: value
    };
    
    setGuest(updated);
  };

  // Handle guest info changes
  const handleGuestInfoChange = (index: number, field: keyof GuestInfo, value: any) => {
    if (!activeControlNumber) return;
    
    const updated = { ...guest };
    const controlData = updated.control_number[activeControlNumber];
    if (!controlData) return;
    
    // Ensure guest_info array has enough elements
    while (controlData.guest_info.length <= index) {
      controlData.guest_info.push({
        full_name: "",
        age: 18,
        email: "",
        address: ""
      });
    }
    
    controlData.guest_info[index] = {
      ...controlData.guest_info[index],
      [field]: field === 'age' ? (parseInt(value) || 0) : value
    };
    
    setGuest(updated);
  };

  // Add a new guest to the current control number
  const addGuest = () => {
    if (!activeControlNumber) return;
    
    const controlData = guest.control_number[activeControlNumber];
    if (!controlData) return;
    
    const currentCount = controlData.guest_info.length;
    const maxAllowed = controlData.maxGuests;
    
    if (currentCount >= maxAllowed) {
      setError(`Cannot add more than ${maxAllowed} guests. Increase the maximum allowed if needed.`);
      return;
    }
    
    const updated = { ...guest };
    updated.control_number[activeControlNumber].guest_info.push({
      full_name: "",
      age: 18,
      email: "",
      address: ""
    });
    
    // Update the guests count
    updated.control_number[activeControlNumber].guests = updated.control_number[activeControlNumber].guest_info.length;
    
    setGuest(updated);
  };

  // Remove a guest from the current control number
  const removeGuest = (index: number) => {
    if (!activeControlNumber) return;
    
    const controlData = guest.control_number[activeControlNumber];
    if (!controlData || controlData.guest_info.length <= 1) {
      setError("Cannot remove the primary guest. At least one guest is required.");
      return;
    }
    
    const updated = { ...guest };
    updated.control_number[activeControlNumber].guest_info.splice(index, 1);
    
    // Update the guests count
    updated.control_number[activeControlNumber].guests = updated.control_number[activeControlNumber].guest_info.length;
    
    setGuest(updated);
  };

  // Save guest data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!activeControlNumber) {
      setError("No control number selected");
      return;
    }
    
    const controlData = guest.control_number[activeControlNumber];
    if (!controlData || !controlData.reservation_number) {
      setError("Reservation number is required");
      return;
    }
    
    if (!controlData.guest_info.length) {
      setError("At least one guest is required");
      return;
    }
    
    // Validate primary guest info
    const primaryGuest = controlData.guest_info[0];
    if (!primaryGuest.full_name || !primaryGuest.address || primaryGuest.age < 7) {
      setError("Primary guest requires a full name, valid age (>7), and address");
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        router.push("/admin/login");
        return;
      }
      
      // Updated URL to match your API structure
      const url = isNew ? '/api/guests' : `/api/guests/${guestId}`;
      console.log(`Saving guest to: ${url}`);
      console.log("Guest data:", JSON.stringify(guest));
      
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(guest)
      });
      
      console.log("Save response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to save guest: ${response.status}`);
      }
      
      // Display success message
      setSuccess("Guest saved successfully!");
      
      // Wait a moment then redirect back to the guests list
      setTimeout(() => {
        router.push("/admin/guests");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving guest");
      console.error("Error saving guest:", err);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!guestId) return;
    
    if (!window.confirm("Are you sure you want to delete this guest? This action cannot be undone.")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("adminToken");
      
      // Updated URL to match your API structure
      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete guest");
      }
      
      // Redirect back to the guests list
      router.push("/admin/guests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting guest");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/guests")}
            className="mr-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0A5741]">
            {isNew ? "Add New Guest" : "Edit Guest"}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash size={16} className="mr-2" />
              Delete
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={saving || loading}
            className="bg-[#0A5741] hover:bg-[#0A5741]/90 text-white"
          >
            <Save size={16} className="mr-2" />
            {saving ? "Saving..." : "Save Guest"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
          {error}
          <button 
            className="ml-2 text-red-800 font-bold" 
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-12 bg-white rounded-xl shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A5741]"></div>
          <span className="ml-3 text-[#0A5741]">Loading guest data...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Control Number Info */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Control Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A5741] mb-1">
                      Control Number
                    </label>
                    <Input
                      value={activeControlNumber}
                      readOnly
                      className="border-gray-300 bg-gray-50 focus:border-[#0A5741] focus:ring-[#0A5741]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A5741] mb-1">
                      Reservation Number
                    </label>
                    <Input
                      value={guest.control_number[activeControlNumber]?.reservation_number || ''}
                      onChange={(e) => handleControlNumberChange('reservation_number', e.target.value)}
                      className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A5741] mb-1">
                      Maximum Guests Allowed
                    </label>
                    <Input
                      type="number"
                      value={guest.control_number[activeControlNumber]?.maxGuests || 1}
                      onChange={(e) => handleControlNumberChange('maxGuests', parseInt(e.target.value) || 1)}
                      className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      id="submitted"
                      checked={guest.control_number[activeControlNumber]?.submitted || false}
                      onChange={(e) => handleControlNumberChange('submitted', e.target.checked)}
                      className="h-4 w-4 text-[#0A5741] focus:ring-[#0A5741] border-gray-300 rounded"
                    />
                    <label htmlFor="submitted" className="ml-2 block text-sm text-gray-900">
                      Submitted
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Guest Info */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Guests</h2>
                  <Button
                    type="button"
                    onClick={addGuest}
                    disabled={
                      !activeControlNumber || 
                      (guest.control_number[activeControlNumber]?.guest_info.length || 0) >= 
                      (guest.control_number[activeControlNumber]?.maxGuests || 1)
                    }
                    className="bg-[#0A5741] hover:bg-[#0A5741]/90 text-white flex items-center gap-1 text-sm"
                  >
                    <PlusCircle size={16} />
                    Add Guest
                  </Button>
                </div>
                
                {activeControlNumber && guest.control_number[activeControlNumber]?.guest_info.map((guestInfo, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">
                        {index === 0 ? "Primary Guest" : `Additional Guest #${index}`}
                      </h3>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeGuest(index)}
                          className="text-red-600 h-8 px-2"
                        >
                          <MinusCircle size={16} className="mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0A5741] mb-1">
                          Full Name
                        </label>
                        <Input
                          value={guestInfo.full_name}
                          onChange={(e) => handleGuestInfoChange(index, 'full_name', e.target.value)}
                          className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                          required={index === 0}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0A5741] mb-1">
                          Age
                        </label>
                        <Input
                          type="number"
                          value={guestInfo.age}
                          onChange={(e) => handleGuestInfoChange(index, 'age', e.target.value)}
                          className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                          min="7"
                          required={index === 0}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0A5741] mb-1">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={guestInfo.email || ''}
                          onChange={(e) => handleGuestInfoChange(index, 'email', e.target.value)}
                          className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0A5741] mb-1">
                          Address
                        </label>
                        <Input
                          value={guestInfo.address}
                          onChange={(e) => handleGuestInfoChange(index, 'address', e.target.value)}
                          className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                          required={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!activeControlNumber || !guest.control_number[activeControlNumber]?.guest_info.length) && (
                  <div className="text-center p-6 text-gray-500">
                    No control number selected or no guests found.
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}