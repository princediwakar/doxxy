import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { CalendarPlus, Users, User, Home, LogOut, CreditCard, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Users, label: "Patients", path: "/patients" },
    { icon: User, label: "Doctors", path: "/doctors" },
    { icon: CalendarPlus, label: "Appointments", path: "/appointments" },
    { icon: CreditCard, label: "Billing", path: "/billing" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
        <h1 className="text-xl font-semibold text-primary">Neurovision</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} />
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r transition-all duration-300 z-20",
          sidebarOpen ? "w-64" : "w-0 md:w-20",
          "fixed md:sticky top-0 h-full md:h-screen overflow-hidden"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center w-full">
              {/* Logo and App Name */}
              <div className="flex items-center gap-2 flex-grow">
                <img src="/logo.svg" alt="Neurovision Logo" className="h-8 w-8" />
                <h1 className="text-xl font-bold text-primary">Neurovision</h1>
              </div>
              {/* Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex"
                onClick={() => setSidebarOpen(false)}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={20} />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex w-full justify-center"
              onClick={() => setSidebarOpen(true)}
              aria-label="Expand sidebar"
            >
              <ChevronRight size={20} />
            </Button>
          )}
        </div>

        <nav className="mt-6 flex flex-col h-[calc(100vh-80px)] justify-between">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center py-3 px-4 rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className={cn(
                    "ml-3 transition-opacity duration-200",
                    sidebarOpen ? "opacity-100" : "opacity-0 md:opacity-0 hidden md:block"
                  )}>
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
          {/* User Area at bottom - now a clickable Popover trigger */}
          {user && user.user_metadata && (
            <div className="mt-auto p-4 border-t flex items-center justify-center">
               {sidebarOpen ? (
                 <Popover>
                   <PopoverTrigger asChild>
                     <Button variant="ghost" className="w-full justify-start h-10 px-2">
                       <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                            <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">{user?.user_metadata?.name || user?.email}</span>
                          </div>
                       </div>
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-48 mb-2">
                     <div className="flex items-center gap-2 p-2">
                       <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.user_metadata?.avatar_url} />
                          <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <div className="flex flex-col">
                         <span className="text-sm font-medium">{user?.user_metadata?.name || user?.email}</span>
                       </div>
                     </div>
                     <Separator />
                     <Button variant="ghost" className="w-full justify-start mt-2" onClick={handleLogout}>
                       <User size={16} className="h-4 w-4 mr-2" />
                       Logout
                     </Button>
                   </PopoverContent>
                 </Popover>
               ) : (
                 <Popover>
                   <PopoverTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user?.user_metadata?.avatar_url} />
                          <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-48 mb-2 ml-2">
                     <div className="flex items-center gap-2 p-2">
                       <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.user_metadata?.avatar_url} />
                          <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user?.user_metadata?.name || user?.email}</span>
                        </div>
                     </div>
                     <Separator />
                     <Button variant="ghost" className="w-full justify-start mt-2" onClick={handleLogout}>
                       <User size={16} className="h-4 w-4 mr-2" />
                       Logout
                     </Button>
                   </PopoverContent>
                 </Popover>
               )}
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "md:ml-0" : "md:ml-0"
      )}>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Expand Sidebar Button - appears when collapsed, positioned absolutely */}
      {!sidebarOpen && (
        <div className="absolute top-4 left-4 z-10 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Expand sidebar"
            className="bg-background/80 backdrop-blur-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Layout;
