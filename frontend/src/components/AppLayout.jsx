import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { api, transformApplicationToApplicant } from "@/services/api";

export function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    syncUserProfile();
  }, []);

  const syncUserProfile = async () => {
    try {
      const user = await api.getCurrentUser();
      if (user) {
        localStorage.setItem("ats-user-name", user.name);
        if (user.profile_photo) {
          const photoUrl = `http://localhost:8000/${user.profile_photo.replace(/\\/g, '/')}`;
          localStorage.setItem("ats-user-photo", photoUrl);
        }
      }
    } catch (error) {
      console.error("Error syncing profile:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const role = localStorage.getItem("ats-role");
      if (role === "admin" || role === "hr") {
        const applications = await api.getApplications();
        const recentApps = applications
          .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
          .slice(0, 5)
          .map(app => {
            const applicant = transformApplicationToApplicant(app);
            return {
              id: app._id,
              type: "application",
              title: "New Application",
              message: `${applicant.name} applied for ${applicant.role}`,
              time: getTimeAgo(app.applied_at),
              avatar: applicant.avatar,
              read: false,
            };
          });
        setNotifications(recentApps);
        setUnreadCount(recentApps.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "ml-16" : "ml-60"
          }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-card border-b border-border">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type to search..."
              className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-xl shadow-elevated z-50">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div>
                      <h3 className="font-semibold">Notifications</h3>
                      <p className="text-xs text-muted-foreground">
                        {unreadCount} unread
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 rounded-lg hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer ${!notif.read ? "bg-primary/5" : ""
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {notif.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{notif.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {notif.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notif.time}
                              </p>
                            </div>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-primary rounded-full mt-2" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {localStorage.getItem("ats-user-name") || "User"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {localStorage.getItem("ats-role") || "Admin"}
                </p>
              </div>
              <Avatar className="h-9 w-9 bg-primary">
                <AvatarImage src={localStorage.getItem("ats-user-photo")} alt="Profile" className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {(() => {
                    const name = localStorage.getItem("ats-user-name") || "User";
                    const parts = name.split(" ");
                    if (parts.length >= 2) {
                      return (parts[0][0] + parts[1][0]).toUpperCase();
                    }
                    return name.substring(0, 2).toUpperCase();
                  })()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
