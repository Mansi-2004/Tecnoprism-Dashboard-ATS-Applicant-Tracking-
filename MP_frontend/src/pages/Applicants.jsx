import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  LayoutGrid,
  List,
  Download,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { api, transformApplicationToApplicant } from "@/services/api";
import { ApplicantCard } from "@/components/ApplicantCard";

const statusFilters = ["All", "New", "In Processing", "Shortlisted", "Interview", "Hired", "Rejected"];

export default function Applicants() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'table'

  const fetchApplicants = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const applications = await api.getApplications();
      const transformedApplicants = applications.map(transformApplicationToApplicant);
      setApplicants(transformedApplicants);

      // Select first applicant by default if none selected
      if (transformedApplicants.length > 0 && !selectedId && !isSilent) {
        setSelectedId(transformedApplicants[0].id);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
    const interval = setInterval(() => fetchApplicants(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = applicants.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedApplicant = applicants.find(a => a.id === selectedId) || (filtered.length > 0 ? filtered[0] : null);

  // Stats calculation
  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === "New" || a.status === "In Processing").length,
    shortlisted: applicants.filter(a => a.status === "Shortlisted").length
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">Review and manage candidate applications</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6 shadow-card flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-all">
          <p className="text-3xl font-bold text-primary mb-1">{stats.total}</p>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 shadow-card flex flex-col items-center justify-center text-center hover:border-warning/50 transition-all">
          <p className="text-3xl font-bold text-warning mb-1">{stats.pending}</p>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 shadow-card flex flex-col items-center justify-center text-center hover:border-success/50 transition-all">
          <p className="text-3xl font-bold text-success mb-1">{stats.shortlisted}</p>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Shortlisted</p>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-card flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates, emails, or jobs..."
            className="pl-9 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-muted/30 border-none text-sm font-medium rounded-lg h-10 px-3 focus:ring-1 focus:ring-primary outline-none"
          >
            {statusFilters.map(f => <option key={f} value={f}>{f === "All" ? "All Status" : f}</option>)}
          </select>

          <div className="flex items-center bg-muted/30 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "table" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "card" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Applicant</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Role</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">ATS Score</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => { setSelectedId(c.id); setViewMode("card"); }}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarImage src={c.profilePhoto} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{c.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{c.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${c.atsScore >= 80 ? "text-success" : c.atsScore >= 60 ? "text-warning" : "text-destructive"}`}>{c.atsScore}%</span>
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.atsScore >= 80 ? "bg-success" : c.atsScore >= 60 ? "bg-warning" : "bg-destructive"}`}
                            style={{ width: `${c.atsScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {c.appliedDate}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: Applicant List */}
          <div className="lg:col-span-3 space-y-3 h-[calc(100vh-320px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
            <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-2">
              APPLICATIONS <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{filtered.length}</span>
            </h3>
            {filtered.map((c) => (
              <ApplicantCard
                key={c.id}
                applicant={c}
                selected={selectedId === c.id}
                onClick={() => setSelectedId(c.id)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10 bg-muted/10 rounded-xl border border-dashed border-border">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No matches found</p>
              </div>
            )}
          </div>

          {/* Column 2: Analysis */}
          <div className="lg:col-span-4 bg-card rounded-xl border border-border shadow-card h-[calc(100vh-320px)] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Analysis</h3>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>

            {selectedApplicant ? (
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedApplicant.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {selectedApplicant.role} • {selectedApplicant.experience || "N/A"} years experience
                  </p>

                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {selectedApplicant.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedApplicant.phone}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <StatusBadge status={selectedApplicant.status} />

                    <div className="flex bg-muted/30 p-1 rounded-lg">
                      <select
                        className="bg-transparent border-none text-xs font-bold outline-none cursor-pointer pr-4"
                        value={selectedApplicant.status}
                        onChange={(e) => {
                          const statusMapReverse = {
                            "New": "Applied",
                            "In Processing": "Under Review",
                            "Shortlisted": "Shortlisted",
                            "Interview": "Interview Scheduled",
                            "Hired": "Selected",
                            "Rejected": "Rejected"
                          };
                          const backendStatus = statusMapReverse[e.target.value] || e.target.value;
                          api.updateApplicationStatus(selectedApplicant.id, backendStatus)
                            .then(() => fetchApplicants(true))
                            .catch(err => alert("Update failed: " + err.message));
                        }}
                      >
                        <option value="" disabled>Change Status</option>
                        {["New", "In Processing", "Shortlisted", "Interview", "Hired", "Rejected"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-muted/20 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold">ATS Match Score</h4>
                    <span className="text-2xl font-black text-primary">{selectedApplicant.atsScore}%</span>
                  </div>
                  <Progress value={selectedApplicant.atsScore} className="h-3 bg-card" />
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="p-3 rounded-xl bg-card border border-border text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Keywords</p>
                      <p className="text-sm font-bold text-success capitalize">{selectedApplicant.matchDetails?.keywordsMatch || "High"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-card border border-border text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Experience</p>
                      <p className="text-sm font-bold text-primary capitalize">{selectedApplicant.matchDetails?.experienceMatch || "Match"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                    Skills Breakdown
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.requiredSkills?.map((skill, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all
                          ${skill.matched
                            ? "bg-success/10 border-success/30 text-success"
                            : "bg-destructive/5 border-destructive/20 text-destructive grayscale-[0.5] opacity-70"
                          }`}
                      >
                        {skill.matched ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {skill.name}
                      </span>
                    ))}
                    {(!selectedApplicant.requiredSkills || selectedApplicant.requiredSkills.length === 0) && (
                      <p className="text-xs text-muted-foreground italic">No skill analysis available</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-3">
                <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
                <p className="text-muted-foreground">Select an application to view analysis breakdown</p>
              </div>
            )}
          </div>

          {/* Column 3: Resume Preview */}
          <div className="lg:col-span-5 bg-card rounded-xl border border-border shadow-card h-[calc(100vh-320px)] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Resume Preview</h3>
              <div className="flex gap-2">
                {selectedApplicant?.resumeUrl && (
                  <>
                    <a
                      href={selectedApplicant.resumeUrl}
                      download
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                    <a
                      href={selectedApplicant.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 bg-muted/5 p-4">
              {selectedApplicant?.resumeUrl ? (
                <div className="w-full h-full rounded-lg border border-border shadow-inner bg-card overflow-hidden">
                  {selectedApplicant.resumeUrl.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={`${selectedApplicant.resumeUrl}#toolbar=0&navpanes=0`}
                      className="w-full h-full border-none"
                      title="Resume Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                      <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <FileText className="h-10 w-10 text-primary" />
                      </div>
                      <div className="space-y-2 px-4">
                        <p className="font-bold text-lg">Preview Not Available</p>
                        <p className="text-sm text-muted-foreground mx-auto max-w-[300px]">
                          This resume is in a format (DOCX/DOC) that requires local viewing.
                          Click below to download and view the full content.
                        </p>
                      </div>
                      <a
                        href={selectedApplicant.resumeUrl}
                        download
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 mt-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Resume
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm font-medium">No resume available for preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
