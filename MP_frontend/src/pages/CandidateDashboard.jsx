import { useState, useEffect } from "react";
import { Send, CheckCircle, Clock, Briefcase, ArrowRight, Search, MapPin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { api, transformApplicationToApplicant } from "@/services/api";
import { Link } from "react-router-dom";

export default function CandidateDashboard() {
    const [stats, setStats] = useState({
        totalApplied: 0,
        shortlisted: 0,
        pending: 0,
        activeJobs: 0,
    });
    const [recentApps, setRecentApps] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidateData = async () => {
            try {
                setLoading(true);
                const [appsData, jobsData] = await Promise.all([
                    api.getMyApplications(),
                    api.getJobs()
                ]);

                const apps = appsData;
                const jobs = jobsData;

                const pendingStatuses = ["Applied", "Under Review"];

                setStats({
                    totalApplied: apps.length,
                    shortlisted: apps.filter(a => a.status === "Shortlisted").length,
                    pending: apps.filter(a => pendingStatuses.includes(a.status)).length,
                    activeJobs: jobs.length,
                });

                const transformedApps = apps.sort((a, b) =>
                    new Date(b.applied_at) - new Date(a.applied_at)
                ).slice(0, 3).map(transformApplicationToApplicant);

                setRecentApps(transformedApps);
                setRecommendedJobs(jobs.slice(0, 3));

            } catch (error) {
                console.error("Error fetching candidate dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidateData();
    }, []);

    const statCards = [
        { label: "Applications Sent", value: stats.totalApplied.toString(), icon: Send, color: "primary" },
        { label: "Shortlisted", value: stats.shortlisted.toString(), icon: CheckCircle, color: "success" },
        { label: "Pending Review", value: stats.pending.toString(), icon: Clock, color: "warning" },
        { label: "Available Jobs", value: stats.activeJobs.toString(), icon: Briefcase, color: "info" },
    ];

    const iconBgMap = {
        primary: "bg-primary/10 text-primary",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        info: "bg-info/10 text-info",
    };

    if (loading) {
        return (
            <div className="animate-fade-in space-y-6">
                <h1 className="text-2xl font-bold">Candidate Dashboard</h1>
                <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Candidate Dashboard</h1>
                    <p className="text-muted-foreground">Track your applications and find your next role.</p>
                </div>
                <Link
                    to="/jobs"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    <Search className="h-4 w-4" />
                    Browse Jobs
                </Link>
            </div>

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Your Applications */}
                <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <h2 className="text-lg font-semibold">Your Applications</h2>
                        <Link to="/my-applications" className="text-sm text-primary font-medium hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-border px-6">
                        {recentApps.length > 0 ? (
                            recentApps.map((app) => (
                                <div key={app.id} className="py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{app.role}</p>
                                            <p className="text-xs text-muted-foreground">Applied on {app.appliedDate}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={app.status} />
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-muted-foreground text-sm font-medium">
                                You haven't applied to any jobs yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommended Jobs */}
                <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <h2 className="text-lg font-semibold">Recommended for You</h2>
                        <Link to="/jobs" className="text-sm text-primary font-medium hover:underline">Browse All</Link>
                    </div>
                    <div className="divide-y divide-border px-6">
                        {recommendedJobs.length > 0 ? (
                            recommendedJobs.map((job) => (
                                <div key={job.id || job._id} className="py-4 flex items-center justify-between group">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{job.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {job.location} • {job.type}
                                        </p>
                                    </div>
                                    <Link to="/jobs" className="p-2 rounded-full hover:bg-muted transition-colors ml-4">
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-muted-foreground text-sm font-medium">
                                No job recommendations available yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
