import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { api, transformApplicationToApplicant } from "@/services/api";

const statusFilters = ["All", "New", "In Processing", "Shortlisted", "Interview", "Hired", "Rejected"];

export default function Applicants() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        const applications = await api.getApplications();
        const transformedApplicants = applications.map(transformApplicationToApplicant);
        setApplicants(transformedApplicants);
      } catch (error) {
        console.error("Error fetching applicants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  const filtered = applicants.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  const todayJoined = applicants.filter((c) => c.appliedDate === today);

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold">Applicants</h1>
        <p className="text-muted-foreground">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold">Applicants</h1>

      {/* Today's Joiners */}
      {todayJoined.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-primary mb-2">Joined Today</h2>
          <div className="flex gap-3 flex-wrap">
            {todayJoined.map((c) => (
              <div key={c.id} className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{c.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applicants..." className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Applicant</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Skills</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">ATS Score</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Applied</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((c) => (
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
                    <td className="px-6 py-3 text-sm">{c.role}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {c.skills.slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs">{s}</span>
                        ))}
                        {c.skills.length > 3 && <span className="text-xs text-muted-foreground">+{c.skills.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{c.atsScore}%</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${c.atsScore >= 85 ? "bg-success" : c.atsScore >= 70 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${c.atsScore}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{c.appliedDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                    No applicants found
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
