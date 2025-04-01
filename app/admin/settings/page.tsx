"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Save,
  Settings,
  Mail,
  Palette,
  Calendar,
  MapPin,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash
} from "lucide-react";

interface EventLocation {
  name: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  googleMapsUrl?: string;
}

interface EmailSettings {
  senderEmail: string;
  senderName: string;
  invitationSubject: string;
  invitationTemplate: string;
  reminderSubject: string;
  reminderTemplate: string;
}

interface Customization {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl?: string;
  backgroundImageUrl?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface AdditionalInfo {
  accommodations?: string;
  dress_code?: string;
  registry?: string;
  faqs?: FAQ[];
}

interface Settings {
  _id?: string;
  eventName: string;
  eventDate: string;
  eventLocation: EventLocation;
  rsvpDeadline: string;
  maxGuestsAllowed: number;
  emailSettings: EmailSettings;
  customization: Customization;
  additionalInfo?: AdditionalInfo;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    eventName: '',
    eventDate: '',
    eventLocation: {
      name: '',
      address: '',
      city: '',
      country: '',
    },
    rsvpDeadline: '',
    maxGuestsAllowed: 100,
    emailSettings: {
      senderEmail: '',
      senderName: '',
      invitationSubject: 'You\'re Invited!',
      invitationTemplate: '',
      reminderSubject: 'RSVP Reminder',
      reminderTemplate: '',
    },
    customization: {
      primaryColor: '#0A5741',
      secondaryColor: '#F59E0B',
      fontFamily: 'Cormorant Garamond, serif',
    },
    additionalInfo: {
      faqs: []
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState({
    general: true,
    location: false,
    emails: false,
    appearance: false,
    additional: false
  });
  const [faqs, setFaqs] = useState<FAQ[]>([{ question: '', answer: '' }]);
  
  const router = useRouter();

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section]
    });
  };

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        
        if (!token) {
          router.push("/admin/login");
          return;
        }
        
        const response = await fetch("/api/settings", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          router.push("/admin/login");
          return;
        }
        
        // If no settings exist yet, we'll create them when saving
        if (response.status === 404) {
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Format dates for input fields
        const formattedData = {
          ...data,
          eventDate: new Date(data.eventDate).toISOString().split('T')[0],
          rsvpDeadline: new Date(data.rsvpDeadline).toISOString().split('T')[0]
        };
        
        setSettings(formattedData);
        
        // Set FAQs for separate state management
        setFaqs(data.additionalInfo?.faqs || [{ question: '', answer: '' }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading settings");
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  // Handle form input changes
  // Handle form input changes
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      
      // Type-safe approach for nested fields
      if (parent === "eventLocation") {
        setSettings({
          ...settings,
          eventLocation: {
            ...settings.eventLocation,
            [child]: value
          }
        });
      } 
      else if (parent === "emailSettings") {
        setSettings({
          ...settings,
          emailSettings: {
            ...settings.emailSettings,
            [child]: value
          }
        });
      }
      else if (parent === "customization") {
        setSettings({
          ...settings,
          customization: {
            ...settings.customization,
            [child]: value
          }
        });
      }
      else if (parent === "additionalInfo" && settings.additionalInfo) {
        setSettings({
          ...settings,
          additionalInfo: {
            ...settings.additionalInfo,
            [child]: value
          }
        });
      }
    } else {
      // For top-level fields
      setSettings({
        ...settings,
        [name]: value
      });
    }
  };

  // Handle FAQ changes
  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  // Add new FAQ
  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  // Remove FAQ
  const removeFaq = (index: number) => {
    const updatedFaqs = [...faqs];
    updatedFaqs.splice(index, 1);
    setFaqs(updatedFaqs);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        router.push("/admin/login");
        return;
      }
      
      // Prepare the data
      const saveData = {
        ...settings,
        additionalInfo: {
          ...settings.additionalInfo,
          faqs: faqs.filter(faq => faq.question.trim() && faq.answer.trim()) // Only save complete FAQs
        }
      };
      
      // Determine if we're creating or updating
      const method = settings._id ? "PUT" : "POST";
      
      const response = await fetch("/api/settings", {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(saveData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format dates for input fields
      const formattedData = {
        ...data,
        eventDate: new Date(data.eventDate).toISOString().split('T')[0],
        rsvpDeadline: new Date(data.rsvpDeadline).toISOString().split('T')[0]
      };
      
      setSettings(formattedData);
      setSuccess("Settings saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving settings");
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#0A5741]">
          Event Settings
        </h1>
        <Button 
          onClick={handleSubmit}
          disabled={saving || loading}
          className="bg-[#0A5741] hover:bg-[#0A5741]/90 text-white gap-2"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Settings"}
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

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-12 bg-white rounded-xl shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A5741]"></div>
          <span className="ml-3 text-[#0A5741]">Loading settings...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 space-y-6">
            {/* General Settings Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('general')}
              >
                <div className="flex items-center gap-2">
                  <Settings size={20} className="text-[#0A5741]" />
                  <h2 className="text-xl font-semibold text-[#0A5741]">General Event Settings</h2>
                </div>
                {openSections.general ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {openSections.general && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        Event Name
                      </label>
                      <Input
                        name="eventName"
                        value={settings.eventName}
                        onChange={handleChange}
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
                        name="maxGuestsAllowed"
                        value={settings.maxGuestsAllowed}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        required
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        Event Date
                      </label>
                      <Input
                        type="date"
                        name="eventDate"
                        value={settings.eventDate}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        RSVP Deadline
                      </label>
                      <Input
                        type="date"
                        name="rsvpDeadline"
                        value={settings.rsvpDeadline}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('location')}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-[#0A5741]" />
                  <h2 className="text-xl font-semibold text-[#0A5741]">Event Location</h2>
                </div>
                {openSections.location ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {openSections.location && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A5741] mb-1">
                      Venue Name
                    </label>
                    <Input
                      name="eventLocation.name"
                      value={settings.eventLocation.name}
                      onChange={handleChange}
                      className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#0A5741] mb-1">
                      Address
                    </label>
                    <Input
                      name="eventLocation.address"
                      value={settings.eventLocation.address}
                      onChange={handleChange}
                      className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        City
                      </label>
                      <Input
                        name="eventLocation.city"
                        value={settings.eventLocation.city}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        State/Province
                      </label>
                      <Input
                        name="eventLocation.state"
                        value={settings.eventLocation.state || ''}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        Zip/Postal Code
                      </label>
                      <Input
                        name="eventLocation.zipCode"
                        value={settings.eventLocation.zipCode || ''}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        Country
                      </label>
                      <Input
                        name="eventLocation.country"
                        value={settings.eventLocation.country}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#0A5741] mb-1">
                      Google Maps URL (optional)
                    </label>
                    <Input
                      name="eventLocation.googleMapsUrl"
                      value={settings.eventLocation.googleMapsUrl || ''}
                      onChange={handleChange}
                      className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Email Settings Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('emails')}
              >
                <div className="flex items-center gap-2">
                  <Mail size={20} className="text-[#0A5741]" />
                  <h2 className="text-xl font-semibold text-[#0A5741]">Email Settings</h2>
                </div>
                {openSections.emails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {openSections.emails && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        Sender Email
                      </label>
                      <Input
                        type="email"
                        name="emailSettings.senderEmail"
                        value={settings.emailSettings.senderEmail}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        Sender Name
                      </label>
                      <Input
                        name="emailSettings.senderName"
                        value={settings.emailSettings.senderName}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Invitation Email</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-[#0A5741] mb-1">
                          Subject
                        </label>
                        <Input
                          name="emailSettings.invitationSubject"
                          value={settings.emailSettings.invitationSubject}
                          onChange={handleChange}
                          className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#0A5741] mb-1">
                          Email Template
                        </label>
                        <textarea
                          name="emailSettings.invitationTemplate"
                          value={settings.emailSettings.invitationTemplate}
                          onChange={handleChange}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#0A5741] focus:ring-[#0A5741] h-32"
                          required
                          placeholder="Dear [name], You're invited to our wedding..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use [name] as a placeholder for the guest name.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Reminder Email</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-[#0A5741] mb-1">
                          Subject
                        </label>
                        <Input
                          name="emailSettings.reminderSubject"
                          value={settings.emailSettings.reminderSubject}
                          onChange={handleChange}
                          className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#0A5741] mb-1">
                          Email Template
                        </label>
                        <textarea
                          name="emailSettings.reminderTemplate"
                          value={settings.emailSettings.reminderTemplate}
                          onChange={handleChange}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#0A5741] focus:ring-[#0A5741] h-32"
                          required
                          placeholder="Dear [name], This is a reminder for our wedding..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use [name] as a placeholder for the guests name.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Appearance Settings Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('appearance')}
              >
                <div className="flex items-center gap-2">
                  <Palette size={20} className="text-[#0A5741]" />
                  <h2 className="text-xl font-semibold text-[#0A5741]">Appearance Settings</h2>
                </div>
                {openSections.appearance ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {openSections.appearance && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center">
                        <Input
                          type="color"
                          name="customization.primaryColor"
                          value={settings.customization.primaryColor}
                          onChange={handleChange}
                          className="w-14 h-10 p-1 mr-2"
                        />
                        <Input
                          type="text"
                          name="customization.primaryColor"
                          value={settings.customization.primaryColor}
                          onChange={handleChange}
                          className="flex-1 border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        Secondary Color
                      </label>
                      <div className="flex items-center">
                        <Input
                          type="color"
                          name="customization.secondaryColor"
                          value={settings.customization.secondaryColor}
                          onChange={handleChange}
                          className="w-14 h-10 p-1 mr-2"
                        />
                        <Input
                          type="text"
                          name="customization.secondaryColor"
                          value={settings.customization.secondaryColor}
                          onChange={handleChange}
                          className="flex-1 border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        Font Family
                      </label>
                      <select
                        name="customization.fontFamily"
                        value={settings.customization.fontFamily}
                        onChange={handleChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#0A5741] focus:ring-[#0A5741] p-2"
                      >
                        <option value="Cormorant Garamond, serif">Cormorant Garamond</option>
                        <option value="Roboto, sans-serif">Roboto</option>
                        <option value="Playfair Display, serif">Playfair Display</option>
                        <option value="Montserrat, sans-serif">Montserrat</option>
                        <option value="Lato, sans-serif">Lato</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        Logo URL (optional)
                      </label>
                      <Input
                        name="customization.logoUrl"
                        value={settings.customization.logoUrl || ''}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#0A5741] mb-1">
                        Background Image URL (optional)
                      </label>
                      <Input
                        name="customization.backgroundImageUrl"
                        value={settings.customization.backgroundImageUrl || ''}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                        placeholder="https://example.com/background.jpg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('additional')}
              >
                <div className="flex items-center gap-2">
                  <Info size={20} className="text-[#0A5741]" />
                  <h2 className="text-xl font-semibold text-[#0A5741]">Additional Information</h2>
                </div>
                {openSections.additional ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {openSections.additional && (
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#0A5741] mb-1">
                      Accommodations (optional)
                    </label>
                    <textarea
                      name="additionalInfo.accommodations"
                      value={settings.additionalInfo?.accommodations || ''}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#0A5741] focus:ring-[#0A5741] h-32"
                      placeholder="Information about nearby hotels, special rates, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#0A5741] mb-1">
                      Dress Code (optional)
                    </label>
                    <Input
                      name="additionalInfo.dress_code"
                      value={settings.additionalInfo?.dress_code || ''}
                      onChange={handleChange}
                      className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                      placeholder="Formal, Semi-formal, Casual, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#0A5741] mb-1">
                      Registry Information (optional)
                    </label>
                    <textarea
                      name="additionalInfo.registry"
                      value={settings.additionalInfo?.registry || ''}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#0A5741] focus:ring-[#0A5741] h-24"
                      placeholder="Information about gift registries, honeymoon fund, etc."
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-[#0A5741]">
                        Frequently Asked Questions
                      </label>
                      <Button
                        type="button"
                        onClick={addFaq}
                        className="text-xs bg-[#0A5741] hover:bg-[#0A5741]/90 text-white"
                      >
                        <Plus size={14} className="mr-1" />
                        Add FAQ
                      </Button>
                    </div>
                    
                    {faqs.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No FAQs added yet.</p>
                    ) : (
                        <div className="space-y-4">
                          {faqs.map((faq, index) => (
                            <div key={index} className="border border-gray-200 rounded-md p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">FAQ #{index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => removeFaq(index)}
                                  className="text-red-600 h-8 px-2"
                                >
                                  <Trash size={16} className="mr-1" />
                                  Remove
                                </Button>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question
                                  </label>
                                  <Input
                                    value={faq.question}
                                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                    className="border-gray-300 focus:border-[#0A5741] focus:ring-[#0A5741]"
                                    placeholder="E.g., What time does the ceremony start?"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Answer
                                  </label>
                                  <textarea
                                    value={faq.answer}
                                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#0A5741] focus:ring-[#0A5741] h-20"
                                    placeholder="E.g., The ceremony starts at 3:00 PM sharp. Please arrive at least 15 minutes early."
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }