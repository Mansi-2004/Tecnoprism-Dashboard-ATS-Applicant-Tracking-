import { useState, useEffect } from "react";
import {
    User,
    Mail,
    MapPin,
    Shield,
    Plus,
    Camera,
    Clock,
    ExternalLink,
    Briefcase,
    Award,
    Globe,
    Settings as SettingsIcon,
    LogOut
} from "lucide-react";
import { api } from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await api.getCurrentUser();
                setUser(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) return <div className="p-10 text-center">User not found</div>;

    const getProfilePhoto = (path) => {
        if (!path) return null;
        return `http://localhost:8000/${path.replace(/\\/g, '/')}`;
    };

    const getInitials = (name) => {
        return name?.split(" ").map(p => p[0]).join("").toUpperCase() || "??";
    };

    return (
        <div className="animate-fade-in space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header Profile Section */}
            <div className="relative">
                <div className="h-48 bg-gradient-to-r from-primary to-indigo-600 rounded-3xl" />
                <Card className="mx-6 -mt-16 border-border shadow-elevated bg-card/80 backdrop-blur-md">
                    <CardContent className="pt-0 pb-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative -mt-10">
                                <Avatar className="h-32 w-32 border-4 border-card shadow-lg ring-2 ring-primary/20">
                                    <AvatarImage src={getProfilePhoto(user.profile_photo)} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                    <Camera className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-2">
                                    <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit mx-auto md:mx-0">
                                        <Shield className="h-3 w-3" />
                                        {user.role}
                                    </span>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {user.email}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Remote / Global</span>
                                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Joined Feb 2026</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link to="/settings" className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-bold hover:bg-muted transition-all">
                                    <SettingsIcon className="h-3.5 w-3.5" />
                                    Edit Account
                                </Link>
                                <Link to="/settings" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all">
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Details
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col: Info */}
                <div className="space-y-6">
                    <Card className="border-border shadow-card">
                        <CardContent className="p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Award className="h-4 w-4 text-primary" />
                                Credentials
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-muted rounded-lg"><Globe className="h-4 w-4" /></div>
                                    <div>
                                        <p className="text-sm font-bold">Language</p>
                                        <p className="text-xs text-muted-foreground">{user.preferences?.language || "English (Default)"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-muted rounded-lg"><Briefcase className="h-4 w-4" /></div>
                                    <div>
                                        <p className="text-sm font-bold">Timezone</p>
                                        <p className="text-xs text-muted-foreground">{user.preferences?.timezone || "UTC (Coordinated)"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Activity/Overview */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-border shadow-card">
                        <CardContent className="p-6">
                            <h3 className="font-bold mb-6">Experience Overview</h3>
                            <div className="p-10 border-2 border-dashed border-border rounded-2xl flex flex-col items-center text-center opacity-50">
                                <Briefcase className="h-10 w-10 mb-4" />
                                <p className="text-sm font-medium">Add your professional history to your profile.</p>
                                <p className="text-xs text-muted-foreground mt-1">This will appear in candidate searches and comparisons.</p>
                                <button className="mt-4 px-4 py-2 bg-muted rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all">
                                    Complete Profile
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">
                        <span>Recent System Access</span>
                        <span className="text-primary hover:underline cursor-pointer">View Logs</span>
                    </div>

                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-success/10 text-success flex items-center justify-center rounded-lg">
                                        <Shield className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Successful Login</p>
                                        <p className="text-xs text-muted-foreground">Chrome on Mac • Oct 24, 2026</p>
                                    </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground/30" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
