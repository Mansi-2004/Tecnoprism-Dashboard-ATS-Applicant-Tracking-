import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, CalendarCheck, Upload, CheckCircle2, FileText, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { api, transformApplicationToApplicant } from "@/services/api";
import { parseDate } from "@/lib/utils";

const pieData = [
  { name: "New", value: 45, color: "hsl(220, 80%, 55%)" },
  { name: "In Processing", value: 32, color: "hsl(35, 92%, 55%)" },
  { name: "Shortlisted", value: 24, color: "hsl(145, 60%, 50%)" },
  { name: "Interview", value: 18, color: "hsl(260, 70%, 60%)" },
  { name: "Hired", value: 12, color: "hsl(160, 60%, 42%)" },
  { name: "Rejected", value: 15, color: "hsl(0, 72%, 55%)" },
];

const iconBgMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

export default function HRDashboard() {
  const [applicants, setApplicants] = useState([]);
  const [stats, setStats] = useState({
    totalApplicants: 0,
    shortlisted: 0,
    rejected: 0,
    interviews: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pieChartData, setPieChartData] = useState(pieData);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDashboardData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const applications = await api.getApplications();

      // Transform applications to applicant format
      const transformedApplicants = applications.map(transformApplicationToApplicant);
      setApplicants(transformedApplicants);

      // Calculate stats from real data
      const totalApplicants = applications.length;
      const shortlisted = applications.filter(app =>
        app.status === "Shortlisted"
      ).length;
      const rejected = applications.filter(app =>
        app.status === "Rejected"
      ).length;
      const interviews = applications.filter(app =>
        app.status === "Interview Scheduled"
      ).length;

      setStats({
        totalApplicants,
        shortlisted,
        rejected,
        interviews,
      });

      // Calculate pie chart data from real applications
      const statusCounts = {
        "New": applications.filter(app => app.status === "Applied" || app.status === "New").length,
        "In Processing": applications.filter(app => app.status === "Under Review" || app.status === "In Processing").length,
        "Shortlisted": applications.filter(app => app.status === "Shortlisted").length,
        "Interview": applications.filter(app => app.status === "Interview Scheduled" || app.status === "Interview").length,
        "Hired": applications.filter(app => app.status === "Selected" || app.status === "Hired").length,
        "Rejected": applications.filter(app => app.status === "Rejected").length,
      };

      const newPieData = [
        { name: "New", value: statusCounts["New"], color: "hsl(220, 80%, 55%)" },
        { name: "In Processing", value: statusCounts["In Processing"], color: "hsl(35, 92%, 55%)" },
        { name: "Shortlisted", value: statusCounts["Shortlisted"], color: "hsl(145, 60%, 50%)" },
        { name: "Interview", value: statusCounts["Interview"], color: "hsl(260, 70%, 60%)" },
        { name: "Hired", value: statusCounts["Hired"], color: "hsl(160, 60%, 42%)" },
        { name: "Rejected", value: statusCounts["Rejected"], color: "hsl(0, 72%, 55%)" },
      ].filter(item => item.value > 0);

      setPieChartData(newPieData.length > 0 ? newPieData : pieData);

      // Generate recent activity
      const sortedApps = [...applications].sort((a, b) =>
        new Date(b.applied_at) - new Date(a.applied_at)
      ).slice(0, 5);

      const activity = sortedApps.map(app => {
        const applicant = transformApplicationToApplicant(app);
        return {
          id: app._id || app.id,
          applicantName: applicant.name,
          role: applicant.role,
          action: applicant.status,
          time: getTimeAgo(app.applied_at),
          avatar: applicant.avatar,
        };
      });

      setRecentActivity(activity);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Real-time polling every 5 seconds
    const interval = setInterval(() => fetchDashboardData(true), 5000);
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
      fetchDashboardData(true);
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
      e.target.value = ""; // Clear for next selection
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "N/A";
    const date = parseDate(dateString);
    const now = new Date();
    const diffMs = now - date;

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Get exact clock time
    const clockTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diffMins < 1) return `Just now (${clockTime})`;
    if (diffMins < 60) return `${diffMins}m ago (${clockTime})`;
    if (diffHours < 24) {
      const remainingMins = diffMins % 60;
      return `${diffHours}h ${remainingMins}m ago (${clockTime})`;
    }

    // For older dates, show the date and time
    const absoluteDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${diffDays}d ago (${absoluteDate} ${clockTime})`;
  };

  const statCards = [
    { label: "Total Applicants", value: stats.totalApplicants.toString(), icon: Users, change: "+12.5%", changeLabel: "from last month", color: "primary" },
    { label: "Shortlisted", value: stats.shortlisted.toString(), icon: UserCheck, change: "+18.2%", changeLabel: "from last month", color: "success" },
    { label: "Rejected", value: stats.rejected.toString(), icon: UserX, change: "-4.3%", changeLabel: "from last month", color: "destructive" },
    { label: "Interviews", value: stats.interviews.toString(), icon: CalendarCheck, change: "+8.1%", changeLabel: "from last month", color: "info" },
  ];

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">HR Workspace</h1>
          <p className="text-muted-foreground">Unified management console for recruitment operations.</p>
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
          <Link to="/applicants" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-all">
            <FileText className="h-4 w-4" />
            Full Database
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
            <p className="text-xs text-success mt-3">
              {card.change} <span className="text-muted-foreground">{card.changeLabel}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Trends */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border shadow-card">
          <h2 className="text-lg font-semibold mb-1">Applicant Distribution</h2>
          <p className="text-sm text-muted-foreground mb-4">Applicants by current status</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(220, 10%, 90%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.applicantName}</p>
                    <p className="text-xs text-muted-foreground">{activity.role}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={activity.action} />
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
          <button className="mt-4 w-full py-2 text-sm text-primary font-medium border border-border rounded-lg hover:bg-muted transition-colors">
            View All Applicants
          </button>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <button className="text-sm text-primary font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Applicant</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">ATS Score</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {applicants.slice(0, 5).length > 0 ? (
                applicants.slice(0, 5).map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{c.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm">{c.role}</p>
                      <p className="text-xs text-muted-foreground">{c.location}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-semibold">{c.atsScore}%</span>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{c.appliedDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
