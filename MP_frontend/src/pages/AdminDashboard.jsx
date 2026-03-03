import { useState, useEffect } from "react";
import { Users, Briefcase, FileText, ShieldAlert, ArrowRight, TrendingUp, Upload, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/services/api";
import { Link } from "react-router-dom";
import { parseDate } from "@/lib/utils";

const growthData = [
    { name: "Jan", users: 12, apps: 45 },
    { name: "Feb", users: 19, apps: 52 },
    { name: "Mar", users: 15, apps: 48 },
    { name: "Apr", users: 22, apps: 61 },
    { name: "May", users: 30, apps: 55 },
    { name: "Jun", users: 25, apps: 67 },
];

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        jobs: 0,
        applications: 0,
        admins: 0,
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    const fetchAdminData = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const [usersRes, jobsRes, appsRes] = await Promise.all([
                api.getUsers(),
                api.getJobs(),
                api.getApplications()
            ]);

            const users = usersRes;
            const jobs = jobsRes;
            const apps = appsRes;

            setStats({
                users: users.length,
                jobs: jobs.length,
                applications: apps.length,
                admins: users.filter(u => u.role === "admin").length,
            });

            setRecentUsers(users.sort((a, b) =>
                parseDate(b.created_at) - parseDate(a.created_at)
            ).slice(0, 5));

        } catch (error) {
            console.error("Error fetching admin dashboard:", error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
        // Poll every 5 seconds for real-time updates
        const interval = setInterval(() => fetchAdminData(true), 5000);
        return () => clearInterval(interval);
    }, []);

    const handleUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        try {
            setUploading(true);
            await api.publicApply("general", selectedFile);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            // Immediate refresh
            fetchAdminData(true);
        } catch (error) {
            alert("Upload failed: " + error.message);
        } finally {
            setUploading(false);
            e.target.value = ""; // Clear for next selection
        }
    };

    const statCards = [
        { label: "Total Users", value: stats.users.toString(), icon: Users, color: "primary" },
        { label: "Active Jobs", value: stats.jobs.toString(), icon: Briefcase, color: "info" },
        { label: "Applications", value: stats.applications.toString(), icon: FileText, color: "success" },
        { label: "System Admins", value: stats.admins.toString(), icon: ShieldAlert, color: "destructive" },
    ];

    const iconBgMap = {
        primary: "bg-primary/10 text-primary",
        success: "bg-success/10 text-success",
        destructive: "bg-destructive/10 text-destructive",
        info: "bg-info/10 text-info",
    };

    if (loading) {
        return (
            <div className="animate-fade-in space-y-6">
                <h1 className="text-2xl font-bold">Admin Overview</h1>
                <p className="text-muted-foreground">Loading system data...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Admin Overview</h1>
                    <p className="text-muted-foreground">Global system statistics and user management.</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        onChange={handleUpload}
                        accept=".pdf,.doc,.docx"
                    />
                    <label
                        htmlFor="resume-upload"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? (
                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Upload className="h-4 w-4" />
                        )}
                        {uploading ? "Processing..." : "Quick Upload Resume"}
                    </label>
                    <Link to="/users" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-all">
                        <Users className="h-4 w-4" />
                        Manage Users
                    </Link>
                </div>
            </div>

            {success && (
                <div className="bg-success/10 border border-success/20 text-success p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-sm font-medium">Resume uploaded and AI scoring complete! Applicant added to database.</p>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div key={card.label} className="bg-card rounded-xl p-5 border border-border shadow-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{card.label}</p>
                                <p className="text-3xl font-bold mt-1">{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${iconBgMap[card.color]}`}>
                                <card.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border shadow-card">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold">System Growth</h2>
                            <p className="text-sm text-muted-foreground">Users & Applications over time</p>
                        </div>
                        <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full text-xs font-bold">
                            <TrendingUp className="h-3 w-3" />
                            +24% Growth
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(262, 60%, 50%)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(262, 60%, 50%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "1px solid hsl(var(--border))",
                                        boxShadow: "var(--shadow-elevated)",
                                        backgroundColor: "hsl(var(--card))",
                                        color: "hsl(var(--foreground))"
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="hsl(262, 60%, 50%)"
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                    strokeWidth={3}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="apps"
                                    stroke="hsl(210, 80%, 55%)"
                                    fillOpacity={0}
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recently Joined */}
                <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <h2 className="text-lg font-semibold">Recently Joined</h2>
                        <Link to="/users" className="text-sm text-primary font-medium hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-border px-6">
                        {recentUsers.length > 0 ? (
                            recentUsers.map((user) => (
                                <div key={user.id || user._id} className="py-4 flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                            {user.email ? user.email.substring(0, 2).toUpperCase() : "??"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold truncate">{user.name || user.email}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-success" />
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-muted-foreground text-sm font-medium">
                                No recent users found.
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-muted/30 border-t border-border mt-auto">
                        <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                            Manage All Users
                            <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
