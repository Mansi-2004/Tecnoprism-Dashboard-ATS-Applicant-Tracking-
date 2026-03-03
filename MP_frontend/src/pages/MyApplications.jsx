import { useState, useEffect } from "react";
import { Briefcase, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { api } from "@/services/api";
import { StatusBadge } from "@/components/StatusBadge";
import { parseDate } from "@/lib/utils";

export default function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyApplications = async () => {
            try {
                setLoading(true);
                const data = await api.getMyApplications();
                setApplications(data);
            } catch (error) {
                console.error("Error fetching my applications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyApplications();
    }, []);

    if (loading) {
        return (
            <div className="animate-fade-in space-y-6">
                <h1 className="text-2xl font-bold">My Applications</h1>
                <p className="text-muted-foreground">Loading your applications...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Applications</h1>
                <p className="text-muted-foreground">Track the status of your job applications.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {applications.length > 0 ? (
                    applications.map((app) => (
                        <div key={app._id} className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-lg transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-bold">{app.job_title}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            Applied on: {parseDate(app.applied_at).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            Match Score: {Math.round(app.score || app.final_score || 0)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={app.status} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-card rounded-xl border border-border p-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-semibold mb-1">No Applications Yet</h3>
                        <p className="text-sm text-muted-foreground">You haven't applied to any jobs yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FileText(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    )
}
