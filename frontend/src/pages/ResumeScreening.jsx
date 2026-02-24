import { useState, useEffect } from "react";
import { ApplicantCard } from "@/components/ApplicantCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, MapPin, CheckCircle2, XCircle, Upload, Briefcase, DollarSign, Calendar } from "lucide-react";
import { api, transformApplicationToApplicant } from "@/services/api";

export default function ResumeScreening() {
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("screening"); // "screening" or "apply"

  // Apply form state
  const [selectedJob, setSelectedJob] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [applications, jobsData] = await Promise.all([
        api.getApplications(),
        api.getJobs()
      ]);
      const transformedApplicants = applications.map(transformApplicationToApplicant);
      setApplicants(transformedApplicants);
      setJobs(jobsData);
      if (transformedApplicants.length > 0 && !selectedId) {
        setSelectedId(transformedApplicants[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      if (!validTypes.includes(selectedFile.type)) {
        alert("Please upload a PDF or Word document");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a resume");
      return;
    }

    // If no job is selected but user is HR, we can allow it (backend will handle general pool)
    const jobId = selectedJob?._id || "general";
    if (jobId === "general" && localStorage.getItem("ats-role") !== "hr") {
      alert("Please select a job position");
      return;
    }

    try {
      setUploading(true);
      await api.publicApply(jobId, file);

      setSuccess(true);
      setFile(null);
      setSelectedJob(null);

      // Refresh applicants list
      fetchData();

      // Switch back to screening view after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setView("screening");
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert(error.message || "Failed to submit application. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const filtered = applicants.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
  );

  const selected = applicants.find((c) => c.id === selectedId) || applicants[0];

  function getScoreColor(score) {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  }

  function getBarColor(score) {
    if (score >= 85) return "bg-success";
    if (score >= 70) return "bg-warning";
    return "bg-destructive";
  }

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold">Resume Screening & Apply</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold">Application Submitted!</h2>
          <p className="text-muted-foreground max-w-md">
            Your application has been successfully submitted and is being processed by our ATS system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resume Screening & Apply</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView("screening")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === "screening"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border hover:bg-muted"
              }`}
          >
            View Applications
          </button>
          {localStorage.getItem("ats-role") === "hr" && (
            <button
              onClick={() => setView("apply")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === "apply"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border hover:bg-muted"
                }`}
            >
              Upload Resume
            </button>
          )}
        </div>
      </div>

      {/* Screening View */}
      {view === "screening" && (
        <div className="flex gap-6 h-[calc(100vh-10rem)]">
          {/* Left Panel - Applicants List */}
          <div className="w-80 shrink-0 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Applicants</h2>
              <span className="text-sm text-muted-foreground">{filtered.length} Applicants</span>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applicants..."
                className="pl-9"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <ApplicantCard
                    key={c.id}
                    applicant={c}
                    selected={c.id === selectedId}
                    onClick={() => setSelectedId(c.id)}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No applicants found</p>
                </div>
              )}
            </div>
          </div>

          {/* Middle Panel - Resume Preview */}
          <div className="flex-1 bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center min-w-0">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-muted rounded-xl flex items-center justify-center">
                <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Resume Preview</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {selected?.name}'s resume was processed and analyzed by our ATS system.
              </p>
            </div>
            {selected && (
              <div className="mt-6 w-full max-w-md space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-3 bg-muted rounded-full" style={{ width: `${70 + Math.random() * 30}%` }} />
                ))}
                <div className="pt-4 space-y-2">
                  <p className="font-semibold text-sm">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.experience}</p>
                  <div className="pt-2">
                    <p className="text-xs font-medium mb-1">Skills:</p>
                    <p className="text-xs text-muted-foreground">{selected.skills.join(", ")}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Applicant Details */}
          {selected && (
            <div className="w-80 shrink-0 overflow-y-auto space-y-5">
              {/* Profile Header */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="text-lg font-bold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">{selected.role} • {selected.experience.split(".")[0]}</p>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {selected.email}</div>
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {selected.phone}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {selected.location}</div>
                </div>
                <div className="mt-3">
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {/* ATS Match Score */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">ATS Match Score</h3>
                  <span className={`text-2xl font-bold ${getScoreColor(selected.atsScore)}`}>
                    {selected.atsScore}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                  <div className={`h-full rounded-full ${getBarColor(selected.atsScore)}`} style={{ width: `${selected.atsScore}%` }} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Keywords Match</span>
                    <span className={selected.matchDetails.keywordsMatch === "High" ? "text-success font-medium" : "text-warning font-medium"}>
                      {selected.matchDetails.keywordsMatch}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience Match</span>
                    <span className={selected.matchDetails.experienceMatch === "Perfect" ? "text-success font-medium" : "text-info font-medium"}>
                      {selected.matchDetails.experienceMatch}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Education</span>
                    <span className="text-info font-medium">{selected.matchDetails.educationMatch}</span>
                  </div>
                </div>
              </div>

              {/* Job Requirement Match */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold text-sm mb-3">Job Requirement Match</h3>
                <div className="space-y-2.5">
                  {selected.requiredSkills.length > 0 ? (
                    selected.requiredSkills.map((skill) => (
                      <div key={skill.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {skill.matched ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{skill.name}</p>
                            <p className="text-xs text-muted-foreground">Required</p>
                          </div>
                        </div>
                        <StatusBadge status={skill.matched ? "Match" : "Missing"} className={skill.matched ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"} />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skill requirements available</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 rounded-lg bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  Shortlist
                </button>
                <button className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Interview
                </button>
                <button className="p-2.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Apply View */}
      {view === "apply" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Selection */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Available Positions ({jobs.length})</h2>

            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => setSelectedJob(job)}
                  className={`bg-card rounded-xl border p-5 cursor-pointer transition-all ${selectedJob?._id === job._id
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 shadow-card"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${selectedJob?._id === job._id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold">{job.title}</h3>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location || "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {job.type || "Full-time"}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {job.salary}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {job.experience_required}+ years
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {job.description}
                      </p>

                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {job.required_skills.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs">
                              {skill}
                            </span>
                          ))}
                          {job.required_skills.length > 5 && (
                            <span className="text-xs text-muted-foreground">+{job.required_skills.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    {selectedJob?._id === job._id && (
                      <CheckCircle2 className="h-5 w-5 text-primary ml-3 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No Open Positions</h3>
                <p className="text-sm text-muted-foreground">Check back later for new opportunities</p>
              </div>
            )}
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 shadow-card sticky top-6">
              <h2 className="text-lg font-semibold mb-4">
                {localStorage.getItem("ats-role") === "hr" ? "Upload Candidate Resume" : "Submit Application"}
              </h2>

              {(selectedJob || localStorage.getItem("ats-role") === "hr") ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-primary">Selected Position:</p>
                    <p className="text-sm font-semibold mt-1">
                      {selectedJob ? selectedJob.title : "General Pool (HR Upload)"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Resume *</label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        id="resume-upload"
                        required
                      />
                      <label
                        htmlFor="resume-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {file ? file.name : "Click to upload"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOC, DOCX (Max 5MB)
                        </p>
                      </label>
                    </div>
                  </div>

                  {file && (
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm font-medium text-success">✓ File selected</p>
                      <p className="text-xs text-muted-foreground mt-1">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={uploading || !file}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Submitting..." : "Submit Application"}
                  </button>

                  <p className="text-xs text-muted-foreground text-center">
                    Your resume will be analyzed by our ATS system
                  </p>
                </form>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a job position to apply
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
