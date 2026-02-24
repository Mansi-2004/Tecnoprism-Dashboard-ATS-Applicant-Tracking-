import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun, User, Mail, Phone, MapPin, Building, Globe, Bell, Shield, Palette, Save, Camera } from "lucide-react";
import { api } from "@/services/api";

export default function SettingsPage() {
  const [theme, setTheme] = useState(localStorage.getItem("ats-theme") || "light");
  const [profile, setProfile] = useState({
    name: localStorage.getItem("ats-user-name") || "John Doe",
    email: localStorage.getItem("ats-user-email") || "john@tecnoprism.com",
    phone: localStorage.getItem("ats-user-phone") || "+91 98765 43210",
    location: localStorage.getItem("ats-user-location") || "Bangalore, India",
    company: localStorage.getItem("ats-company") || "Tecnoprism Technologies",
    domain: localStorage.getItem("ats-domain") || "tecnoprism.com",
  });
  const [userPhoto, setUserPhoto] = useState(localStorage.getItem("ats-user-photo"));

  const [notifications, setNotifications] = useState({
    newApplicants: localStorage.getItem("ats-notif-applicants") === "true" || true,
    interviews: localStorage.getItem("ats-notif-interviews") === "true" || true,
    statusUpdates: localStorage.getItem("ats-notif-status") === "true" || true,
    weeklyReport: localStorage.getItem("ats-notif-weekly") === "true" || false,
  });

  useEffect(() => {
    // Apply theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("ats-theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleProfileChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSaveProfile = () => {
    localStorage.setItem("ats-user-name", profile.name);
    localStorage.setItem("ats-user-email", profile.email);
    localStorage.setItem("ats-user-phone", profile.phone);
    localStorage.setItem("ats-user-location", profile.location);
    localStorage.setItem("ats-company", profile.company);
    localStorage.setItem("ats-domain", profile.domain);
    alert("Profile saved successfully!");
  };

  const handleNotificationChange = (field, value) => {
    const updated = { ...notifications, [field]: value };
    setNotifications(updated);
    localStorage.setItem(`ats-notif-${field === "newApplicants" ? "applicants" : field === "interviews" ? "interviews" : field === "statusUpdates" ? "status" : "weekly"}`, value);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Theme:</span>
          <button
            onClick={handleThemeToggle}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            {theme === "light" ? (
              <>
                <Sun className="h-4 w-4" />
                <span className="text-sm font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span className="text-sm font-medium">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4 pb-4 border-b border-border">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userPhoto} alt="Profile" className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  id="profile-photo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const data = await api.uploadProfilePhoto(file);
                        const photoUrl = data.profile_photo ? `http://localhost:8000/${data.profile_photo.replace(/\\/g, '/')}` : null;
                        setUserPhoto(photoUrl);
                        alert("Profile photo uploaded successfully!");
                      } catch (error) {
                        console.error("Error uploading photo:", error);
                        alert(error.message || "Failed to upload photo");
                      }
                    }
                  }}
                />
                <button
                  onClick={() => document.getElementById("profile-photo-upload").click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">{profile.name}</p>
                <p className="text-sm text-muted-foreground">{localStorage.getItem("ats-role") || "Admin"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{profile.company}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Profile
            </CardTitle>
            <CardDescription>Update your personal and company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => handleProfileChange("location", e.target.value)}
                  placeholder="Bangalore, India"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Organization Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => handleProfileChange("company", e.target.value)}
                    placeholder="Tecnoprism Technologies"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Corporate Domain</Label>
                  <Input
                    id="domain"
                    value={profile.domain}
                    onChange={(e) => handleProfileChange("domain", e.target.value)}
                    placeholder="tecnoprism.com"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive activity alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Applicant Alerts</Label>
                <p className="text-xs text-muted-foreground">Receive emails for every new application</p>
              </div>
              <Switch
                checked={notifications.newApplicants}
                onCheckedChange={(checked) => handleNotificationChange("newApplicants", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Interview Reminders</Label>
                <p className="text-xs text-muted-foreground">Get notified 15 minutes before an interview</p>
              </div>
              <Switch
                checked={notifications.interviews}
                onCheckedChange={(checked) => handleNotificationChange("interviews", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Status Updates</Label>
                <p className="text-xs text-muted-foreground">Notifications when applicant status changes</p>
              </div>
              <Switch
                checked={notifications.statusUpdates}
                onCheckedChange={(checked) => handleNotificationChange("statusUpdates", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-xs text-muted-foreground">Receive weekly hiring analytics summary</p>
              </div>
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) => handleNotificationChange("weeklyReport", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Theme Mode</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-4 rounded-lg border-2 transition-all ${theme === "light"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  <Sun className={`h-6 w-6 mx-auto mb-2 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className={`text-sm font-medium ${theme === "light" ? "text-primary" : "text-muted-foreground"}`}>
                    Light Mode
                  </p>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-4 rounded-lg border-2 transition-all ${theme === "dark"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  <Moon className={`h-6 w-6 mx-auto mb-2 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className={`text-sm font-medium ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`}>
                    Dark Mode
                  </p>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">Reduce spacing for more content</p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Animations</Label>
                <p className="text-xs text-muted-foreground">Enable smooth transitions and effects</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" placeholder="••••••••" />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Update Password</Button>
          </CardFooter>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Configure your application preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="ist">IST (UTC+5:30)</option>
                <option value="pst">PST (UTC-8)</option>
                <option value="est">EST (UTC-5)</option>
                <option value="gmt">GMT (UTC+0)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <select
                id="date-format"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
