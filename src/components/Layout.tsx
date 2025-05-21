
import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { CalendarPlus, Users, User, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Users, label: "Patients", path: "/patients" },
    { icon: User, label: "Doctors", path: "/doctors" },
    { icon: CalendarPlus, label: "Appointments", path: "/appointments" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
        <h1 className="text-xl font-semibold text-primary">MediClinic</h1>
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
          <h1 className={cn("text-xl font-bold text-primary transition-opacity", 
            sidebarOpen ? "opacity-100" : "opacity-0 md:opacity-0"
          )}>
            MediClinic
          </h1>
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </Button>
        </div>

        <nav className="mt-6">
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
    </div>
  );
};

export default Layout;
