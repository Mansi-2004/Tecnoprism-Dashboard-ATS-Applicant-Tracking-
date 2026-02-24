import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  Mail,
  Settings,
  ChevronLeft,
  LogOut,
  Bell,
  Briefcase,
} from "lucide-react";
import tecnoprismLogo from "@/assets/tecnoprism-logo.png";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Resume Screening & Apply", icon: FileText, path: "/resume-screening" },
  { title: "Applicants", icon: Users, path: "/applicants" },
  { title: "Schedule", icon: Calendar, path: "/schedule" },
  { title: "Jobs", icon: Briefcase, path: "/jobs" },
  { title: "Email", icon: Mail, path: "/email" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 z-50 ${collapsed ? "w-16" : "w-60"
        }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <img src={tecnoprismLogo} alt="Tecnoprism" className="h-8 w-8 rounded object-cover" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-sidebar-primary-foreground">
            TECNOPRISM
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                } ${collapsed ? "justify-center" : ""}`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>



      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full transition-all"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("ats-authenticated");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full transition-all"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>

      </div>
    </aside>
  );
}
