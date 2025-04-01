"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Calendar, 
  UserCheck, 
  UserX, 
  Filter, 
  Download, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from "lucide-react";

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

interface Reservation {
  _id: string;
  control_number: {
    [key: string]: ReservationData;
  };
}

const AdminDashboard = () => {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "confirmed" | "pending">("all");
  const [sortField, setSortField] = useState<"control_number" | "guests" | "date">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch reservations data using useCallback to avoid recreation on each render
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        console.log("No admin token found in localStorage, redirecting to login");
        router.push("/admin/login");
        return;
      }
      
      console.log("Fetching reservations with token");
      const response = await fetch("/api/admin/reservations", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        console.log("Token unauthorized (401), redirecting to login");
        localStorage.removeItem("adminToken"); // Clear invalid token
        router.push("/admin/login");
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reservations: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Reservations data received successfully:", data.length);
      setReservations(data);
    } catch (err) {
      setError("Error loading reservations. Please try again.");
      console.error("Error fetching reservations:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Auth check - this should be replaced with proper auth middleware in production
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    console.log("Checking Token:", token);

    if (!token) {
      router.push("/admin/login"); // Redirect to login if no token is found
    } else {
      // Only fetch if we have a token
      fetchReservations();
    }
  }, [router, fetchReservations]);

  // Transform and prepare data for display
  const getTransformedReservations = () => {
    if (!reservations || reservations.length === 0) return [];
  
    return reservations.flatMap((reservation) => {
      return Object.entries(reservation.control_number)
        .filter(([key, value]) => typeof value === "object" && value !== null && "maxGuests" in value) // Ensure it's a valid reservation
        .map(([controlNumber, data]) => {
          return {
            id: reservation._id,
            controlNumber,
            maxGuests: data.maxGuests,
            actualGuests: data.guests,
            status: data.submitted ? "Confirmed" : "Pending",
            submittedAt: data.submittedAt ? new Date(data.submittedAt) : null,
            guestInfo: data.guest_info
          };
        });
    });
  };
  
  // Get filtered and sorted data
  const getFinalData = () => {
    let data = getTransformedReservations();
    
    // Apply search filter
    if (searchTerm) {
      data = data.filter((item) => 
        item.controlNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guestInfo.some(guest => 
          guest.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guest.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply status filter
    if (filterStatus !== "all") {
      data = data.filter((item) => 
        filterStatus === "confirmed" ? item.status === "Confirmed" : item.status === "Pending"
      );
    }
    
    // Apply sorting
    data.sort((a, b) => {
      if (sortField === "control_number") {
        return sortDirection === "asc" 
          ? a.controlNumber.localeCompare(b.controlNumber)
          : b.controlNumber.localeCompare(a.controlNumber);
      } else if (sortField === "guests") {
        return sortDirection === "asc" 
          ? a.actualGuests - b.actualGuests
          : b.actualGuests - a.actualGuests;
      } else { // date
        const dateA = a.submittedAt ? a.submittedAt.getTime() : 0;
        const dateB = b.submittedAt ? b.submittedAt.getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
    });
    
    return data;
  };

  const finalData = getFinalData();
  
  // Pagination
  const totalPages = Math.ceil(finalData.length / itemsPerPage);
  const paginatedData = finalData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sort toggle
  const handleSort = (field: "control_number" | "guests" | "date") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle export to CSV
  const exportToCsv = () => {
    const data = getFinalData();
    
    if (data.length === 0) {
      alert("No data to export");
      return;
    }
    
    // Create CSV header
    let csvContent = "Control Number,Max Guests,Actual Guests,Status,Submitted Date,Primary Guest,Email,Address\n";
    
    // Add data rows
    data.forEach(item => {
      const primaryGuest = item.guestInfo[0] || { full_name: "", email: "", address: "" };
      const submittedDate = item.submittedAt ? item.submittedAt.toLocaleDateString() : "N/A";
      
      csvContent += `"${item.controlNumber}","${item.maxGuests}","${item.actualGuests}","${item.status}","${submittedDate}","${primaryGuest.full_name}","${primaryGuest.email}","${primaryGuest.address}"\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wedding_reservations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewReservationDetails = (id: string, controlNumber: string) => {
    router.push(`/admin/dashboard/reservation/${id}?controlNumber=${controlNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A5741] mx-auto mb-4"></div>
          <p className="text-[#0A5741] text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 md:p-8">
      {/* Header with logo */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="hidden md:block w-12 h-12 relative overflow-hidden rounded-full border-2 border-[#0A5741]">
            <Image 
              src="/card_design/top_flower.webp"
              alt="Wedding Logo"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0A5741]">
            Admin Dashboard
          </h1>
        </div>
        <Button 
          variant="outline" 
          className="text-[#0A5741] border-[#0A5741] hover:bg-[#0A5741] hover:text-white"
          onClick={() => {
            localStorage.removeItem("adminToken");
            router.push("/admin/login");
          }}
        >
          Logout
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Reservations</p>
            <h3 className="text-2xl font-bold text-[#0A5741]">{finalData.length}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <UserCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Confirmed</p>
            <h3 className="text-2xl font-bold text-[#0A5741]">
              {finalData.filter(item => item.status === "Confirmed").length}
            </h3>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <UserX className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <h3 className="text-2xl font-bold text-[#0A5741]">
              {finalData.filter(item => item.status === "Pending").length}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10 border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
              placeholder="Search by control number or guest name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <select
                className="bg-white border border-gray-300 rounded-md py-2 px-3 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#0A5741] focus:border-[#0A5741]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" size={16} />
            </div>
            
            <Button 
              variant="outline" 
              className="bg-white text-[#0A5741] border-[#0A5741] hover:bg-[#0A5741] hover:text-white gap-2"
              onClick={exportToCsv}
            >
              <Download size={16} />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Reservations table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("control_number")}
                >
                  <div className="flex items-center">
                    Control Number
                    {sortField === "control_number" && (
                      sortDirection === "asc" ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("guests")}
                >
                  <div className="flex items-center">
                    Guests
                    {sortField === "guests" && (
                      sortDirection === "asc" ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center">
                    Submitted Date
                    {sortField === "date" && (
                      sortDirection === "asc" ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Primary Guest
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item.controlNumber + index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.controlNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.actualGuests} / {item.maxGuests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.status === "Confirmed" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.submittedAt 
                        ? item.submittedAt.toLocaleDateString() 
                        : "Not submitted yet"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Array.isArray(item.guestInfo) && item.guestInfo.length > 0 
                        ? item.guestInfo[0]?.full_name 
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        className="text-[#0A5741] hover:text-[#0A5741] hover:bg-green-50"
                        onClick={() => viewReservationDetails(item.id, item.controlNumber)}
                      >
                        <MoreHorizontal size={16} />
                        <span className="ml-1 hidden md:inline">Details</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No reservations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      {finalData.length > 0 && (
        <div className="flex justify-between items-center bg-white rounded-xl shadow-md p-4">
          <div className="text-sm text-gray-700">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, finalData.length)} to {Math.min(currentPage * itemsPerPage, finalData.length)} of {finalData.length} reservations
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="text-[#0A5741] border-[#0A5741] hover:bg-[#0A5741] hover:text-white"
            >
              <ChevronLeft size={16} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="text-[#0A5741] border-[#0A5741] hover:bg-[#0A5741] hover:text-white"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;