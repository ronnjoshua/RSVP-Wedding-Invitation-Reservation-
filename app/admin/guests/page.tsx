
"use client"
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  UserPlus, 
  Filter, 
  Download, 
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Mail
} from "lucide-react";
import { Guest, GuestInfo, ControlNumberData } from "@/app/models/GuestModel";

export default function GuestsPage(): JSX.Element {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [sortField, setSortField] = useState<"name" | "email" | "date">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const router = useRouter();

  // Fetch guests with useCallback to memoize the function
  const fetchGuests = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }
      
      // Prepare query params
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (searchTerm) params.append("search", searchTerm);
      
      const url = `/api/guests?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch guests: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate data structure
      if (Array.isArray(data)) {
        setGuests(data);
        setCurrentPage(1); // Reset to first page on new data
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading guests");
      setGuests([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm, router]);

  // Initial load and subsequent updates
  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // Handle search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchGuests();
    }, 500);
    
    return () => clearTimeout(handler);
  }, [searchTerm, fetchGuests]);

  // Handle delete guest
  const handleDeleteGuest = async (id: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this guest?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("adminToken");
      
      const response = await fetch(`/api/guests/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete guest");
      }
      
      // Refresh guest list
      fetchGuests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting guest");
    }
  };

  // Handle sending invitation
  const handleSendInvitation = async (id: string, controlNumber: string): Promise<void> => {
    try {
      const token = localStorage.getItem("adminToken");
      const guestToUpdate = guests.find(g => g._id === id);
      
      if (!guestToUpdate) return;
      
      // Create a deep copy of the guest data
      const updatedGuestData = JSON.parse(JSON.stringify(guestToUpdate));
      
      // Update the submitted status for this control number
      if (updatedGuestData.control_number[controlNumber]) {
        updatedGuestData.control_number[controlNumber].submitted = true;
        updatedGuestData.control_number[controlNumber].submittedAt = new Date().toISOString();
      }
      
      const response = await fetch(`/api/guests/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedGuestData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update invitation status");
      }
      
      // Refresh guest list
      fetchGuests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error sending invitation");
    }
  };

  // Get sorted and filtered guests
  const getSortedAndFilteredGuests = (): Guest[] => {
    let filteredGuests = [...guests];
    
    // Filter by status if specified
    if (filterStatus) {
      filteredGuests = filteredGuests.filter(guest => 
        Object.values(guest.control_number).some(controlData => {
          if (filterStatus === "submitted") {
            return controlData.submitted === true;
          } else if (filterStatus === "pending") {
            return controlData.submitted !== true;
          }
          return true;
        })
      );
    }
    
    // Apply sorting
    filteredGuests.sort((a, b) => {
      const aControlKeys = Object.keys(a.control_number);
      const bControlKeys = Object.keys(b.control_number);
      
      if (aControlKeys.length === 0 || bControlKeys.length === 0) return 0;
      
      const aControlData = a.control_number[aControlKeys[0]];
      const bControlData = b.control_number[bControlKeys[0]];
      
      if (!aControlData || !bControlData) return 0;
      
      const aPrimaryGuest = aControlData.guest_info?.[0];
      const bPrimaryGuest = bControlData.guest_info?.[0];
      
      if (!aPrimaryGuest || !bPrimaryGuest) return 0;
      
      if (sortField === "name") {
        const aName = aPrimaryGuest.full_name || '';
        const bName = bPrimaryGuest.full_name || '';
        return sortDirection === "asc" 
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      } else if (sortField === "email") {
        const aEmail = aPrimaryGuest.email || '';
        const bEmail = bPrimaryGuest.email || '';
        return sortDirection === "asc" 
          ? aEmail.localeCompare(bEmail)
          : bEmail.localeCompare(aEmail);
      } else { // date (creation date)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
    });
    
    return filteredGuests;
  };

  // Handle sort toggle
  const handleSort = (field: "name" | "email" | "date"): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Export guest list to CSV
  const exportToCsv = (): void => {
    const sortedGuests = getSortedAndFilteredGuests();
    
    if (sortedGuests.length === 0) {
      alert("No guests to export");
      return;
    }
    
    // Create CSV content
    let csvContent = "Control Number,Reservation Number,Guest Name,Age,Email,Address,Submission Status,Is Primary Guest\n";
    
    sortedGuests.forEach(guest => {
      Object.entries(guest.control_number).forEach(([controlNum, data]) => {
        data.guest_info.forEach((info, index) => {
          const row = [
            `"${controlNum}"`,
            `"${data.reservation_number || ''}"`,
            `"${info.full_name || ''}"`,
            info.age || 18,
            `"${info.email || ''}"`,
            `"${info.address || ''}"`,
            data.submitted ? "Submitted" : "Pending",
            index === 0 ? "Primary" : "Additional"
          ].join(",");
          
          csvContent += row + "\n";
        });
      });
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `guest_list_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination
  const sortedGuests = getSortedAndFilteredGuests();
  const totalPages = Math.ceil(sortedGuests.length / itemsPerPage);
  const paginatedGuests = sortedGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Render the component
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#0A5741]">
          Guest Management
        </h1>
        <Button 
          className="bg-[#0A5741] hover:bg-[#0A5741]/90 text-white gap-2"
          onClick={() => router.push("/admin/guests/new")}
        >
          <UserPlus size={16} />
          Add Guest
        </Button>
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

      {/* Filter and search controls */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10 border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
              placeholder="Search by name or control number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <select
                className="bg-white border border-gray-300 rounded-md py-2 px-3 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#0A5741] focus:border-[#0A5741]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Submission Status</option>
                <option value="submitted">Submitted</option>
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

      {/* Guests table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A5741]"></div>
            <span className="ml-3 text-[#0A5741]">Loading guests...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Control Number
                      {sortField === "name" && (
                        sortDirection === "asc" ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reservation #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Primary Guest
                      {sortField === "name" && (
                        sortDirection === "asc" ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedGuests.length > 0 ? (
                    paginatedGuests.flatMap((guest) => {
                    // Get all control numbers for this guest
                    const controlNumbers = Object.keys(guest.control_number || {});
                    
                    // Process each control number
                    return controlNumbers.flatMap((controlNumber) => {
                        const controlData = guest.control_number[controlNumber];
                        
                        // Skip if no guest_info or empty guest_info
                        if (!controlData.guest_info || controlData.guest_info.length === 0) {
                        return [];
                        }
                        
                        // Return rows for each guest in this control number
                        return controlData.guest_info.map((guestInfo, guestIndex) => (
                        <tr 
                            key={`${guest._id}-${controlNumber}-${guestIndex}`} 
                            className={`hover:bg-gray-50 ${guestIndex > 0 ? 'border-t border-dashed border-gray-100' : ''}`}
                        >
                            {/* Only show control number and reservation data for the first guest (primary) */}
                            <td className="px-6 py-4 whitespace-nowrap">
                            {guestIndex === 0 ? (
                                <div className="font-medium text-gray-900">{controlNumber}</div>
                            ) : (
                                <div className="text-gray-400 text-xs">Same control #</div>
                            )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {guestIndex === 0 ? controlData.reservation_number : ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                                {guestInfo.full_name || '-'}
                                {guestIndex === 0 && <span className="ml-2 text-xs text-blue-600">(Primary)</span>}
                            </div>
                            <div className="text-sm text-gray-500">
                                {guestInfo.email || '-'}
                            </div>
                            {guestInfo.age && (
                                <div className="text-xs text-gray-400">
                                Age: {guestInfo.age}
                                </div>
                            )}
                            {guestInfo.address && (
                                <div className="text-xs text-gray-400 truncate max-w-xs">
                                {guestInfo.address}
                                </div>
                            )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {guestIndex === 0 ? (
                                `${controlData.guests} / ${controlData.maxGuests}`
                            ) : (
                                <span className="text-xs text-gray-400">Accompanying</span>
                            )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            {guestIndex === 0 ? (
                                controlData.submitted ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Submitted
                                </span>
                                ) : (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center space-x-1 text-xs"
                                    // onClick={() => handleSendInvitation(guest._id, controlNumber)}
                                >
                                    <Mail size={12} />
                                    <span>Send</span>
                                </Button>
                                )
                            ) : (
                                ''
                            )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {guestIndex === 0 ? (
                                <div className="flex justify-end space-x-2">
                                <Link
                                href={guest._id ? `/admin/guests/${guest._id}?control=${controlNumber}` : "#"}
                                className={`text-[#0A5741] hover:text-[#0A5741]/80 ${!guest._id ? 'cursor-not-allowed opacity-50' : ''}`}
                                onClick={(e) => {
                                    if (!guest._id) {
                                    e.preventDefault();
                                    setError("Cannot edit guest: Invalid ID");
                                    }
                                }}
                                >
                                    Edit
                                </Link>
                                <button
                                    // onClick={() => handleDeleteGuest(guest._id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Delete
                                </button>
                                </div>
                            ) : (
                                ''
                            )}
                            </td>
                        </tr>
                        ));
                    });
                    })
                ) : (
                    <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        No guests found. {searchTerm || filterStatus ? "Try adjusting your filters." : "Add a guest to get started."}
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {sortedGuests.length > 0 && (
        <div className="flex justify-between items-center bg-white rounded-xl shadow-md p-4">
          <div className="text-sm text-gray-700">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedGuests.length)} to {Math.min(currentPage * itemsPerPage, sortedGuests.length)} of {sortedGuests.length} guests
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
}