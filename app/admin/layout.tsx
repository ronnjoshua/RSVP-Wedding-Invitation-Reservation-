// app/admin/layout.tsx
"use client";
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { 
  ChevronDown, 
  Users, 
  Settings, 
  LogOut, 
  Home,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Font configurations
const inter = Inter({ subsets: ['latin'] });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
});

const AdminLayout = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if we're on the login page
  const isLoginPage = pathname === '/admin/login';

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    // Check on mount
    checkMobile();
    setLoading(false);

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't show the sidebar on login page
  if (isLoginPage || loading) {
    return <>{children}</>;
  }

  // Navigation items
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/admin/guests', label: 'Guests', icon: <Users size={20} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className={`flex h-screen bg-gray-50 ${inter.className}`}>
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow-md"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: isMobile ? -300 : 0 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 h-full w-64 bg-[#0A5741] text-white z-30
                   flex flex-col shadow-lg`}
      >
        <div className="p-6">
          <h1 className={`text-2xl font-semibold ${cormorant.className}`}>
            Wedding Admin
          </h1>
          <p className="text-sm opacity-70 mt-1">Manage your wedding guests</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center p-3 rounded-lg hover:bg-[#0B6B4F] transition-colors
                             ${pathname === item.path ? 'bg-[#0B6B4F]' : ''}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#0B6B4F]">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start text-white hover:bg-[#0B6B4F]"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.div>

      {/* Main content */}
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out
                  ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}
      >
        {/* Main content container */}
        <main className="p-4 md:p-6 max-h-screen overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;