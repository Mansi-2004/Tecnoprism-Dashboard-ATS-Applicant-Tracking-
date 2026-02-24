import { useState, useEffect } from "react";
import { Upload, Briefcase, MapPin, DollarSign, Calendar, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

export default function Apply() {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await api.getJobs();
            setJobs(data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ];
            if (!validTypes.includes(selectedFile.type)) {
                alert("Please upload a PDF or Word document");
                return;
            }
            // Validate file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                alert("File size must be less than 5MB");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !selectedJob) {
            alert("Please select a job and upload your resume");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("job_id", selectedJob._id);

            const token = localStorage.getItem("ats-token");
            const response = await fetch("http://localhost:8000/api/v1/applications/apply", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to submit application");
            }

            setSuccess(true);
            setFile(null);
            setSelectedJob(null);

            // Reset form after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (error) {
            console.error("Error submitting application:", error);
            alert(error.message || "Failed to submit application. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in space-y-6">
                <h1 className="text-2xl font-bold">Apply for Jobs</h1>
                <p className="text-muted-foreground">Loading available positions...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="animate-fade-in flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <h2 className="text-2xl font-bold">Application Submitted!</h2>
                    <p className="text-muted-foreground max-w-md">
                        Your application has been successfully submitted. Our team will review your resume and get back to you soon.
                    </p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Apply for Another Position
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Apply for Jobs</h1>
                <p className="text-muted-foreground">Upload your resume and apply for open positions</p>
            </div>

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
                                        <CheckCircle className="h-5 w-5 text-primary ml-3 flex-shrink-0" />
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
                        <h2 className="text-lg font-semibold mb-4">Submit Application</h2>

                        {selectedJob ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                    <p className="text-sm font-medium text-primary">Selected Position:</p>
                                    <p className="text-sm font-semibold mt-1">{selectedJob.title}</p>
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
        </div>
    );
}
