import { useState, useEffect } from "react";
import { Plus, Briefcase, MapPin, DollarSign, Calendar, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        type: "Full-time",
        salary: "",
        required_skills: "",
        experience_required: 0,
        education_required: "",
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const jobData = {
                ...formData,
                required_skills: formData.required_skills.split(",").map(s => s.trim()).filter(Boolean),
                experience_required: parseInt(formData.experience_required) || 0,
            };

            // Remove _id from jobData before sending
            const { _id, ...dataToSend } = jobData;

            console.log("Submitting job data:", dataToSend);

            let result;
            if (_id) {
                // Update existing job
                result = await api.updateJob(_id, dataToSend);
                console.log("Job updated successfully:", result);
                alert("Job updated successfully!");
            } else {
                // Create new job
                result = await api.createJob(dataToSend);
                console.log("Job created successfully:", result);
                alert("Job posted successfully!");
            }

            setShowForm(false);
            setFormData({
                title: "",
                description: "",
                location: "",
                type: "Full-time",
                salary: "",
                required_skills: "",
                experience_required: 0,
                education_required: "",
            });
            fetchJobs();
        } catch (error) {
            console.error("Error saving job:", error);
            const errorMessage = error.response?.data?.detail || error.message || "Failed to save job. Please try again.";
            alert(errorMessage);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = async (job) => {
        // Populate form with job data
        setFormData({
            title: job.title,
            description: job.description,
            location: job.location || "",
            type: job.type || "Full-time",
            salary: job.salary || "",
            required_skills: Array.isArray(job.required_skills) ? job.required_skills.join(", ") : "",
            experience_required: job.experience_required || 0,
            education_required: job.education_required || "",
        });
        setShowForm(true);
        // Store the job ID for updating
        setFormData(prev => ({ ...prev, _id: job._id }));
    };

    const handleDelete = async (jobId) => {
        if (!confirm("Are you sure you want to delete this job posting?")) {
            return;
        }

        try {
            await api.deleteJob(jobId);
            alert("Job deleted successfully!");
            fetchJobs();
        } catch (error) {
            console.error("Error deleting job:", error);
            alert(error.message || "Failed to delete job. Please try again.");
        }
    };


    if (loading) {
        return (
            <div className="animate-fade-in space-y-6">
                <h1 className="text-2xl font-bold">Job Postings</h1>
                <p className="text-muted-foreground">Loading jobs...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Job Postings</h1>
                    <p className="text-muted-foreground">{jobs.length} active positions</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus className="h-4 w-4" />
                    {showForm ? "Cancel" : "Post New Job"}
                </button>
            </div>

            {/* Job Creation Form */}
            {showForm && (
                <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h2 className="text-lg font-semibold mb-4">Create New Job Posting</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Job Title *</label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Senior Frontend Developer"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Location *</label>
                                <Input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., Bangalore, India"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Job Type *</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                    required
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Salary Range</label>
                                <Input
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g., ₹10-15 LPA"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Experience (years) *</label>
                                <Input
                                    name="experience_required"
                                    type="number"
                                    value={formData.experience_required}
                                    onChange={handleChange}
                                    placeholder="e.g., 3"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Education Required</label>
                            <Input
                                name="education_required"
                                value={formData.education_required}
                                onChange={handleChange}
                                placeholder="e.g., Bachelor's in Computer Science"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Required Skills * (comma-separated)</label>
                            <Input
                                name="required_skills"
                                value={formData.required_skills}
                                onChange={handleChange}
                                placeholder="e.g., React, Node.js, TypeScript, AWS"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Job Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the role, responsibilities, and requirements..."
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm min-h-[120px]"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                Post Job
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Jobs List */}
            <div className="grid grid-cols-1 gap-4">
                {jobs.length > 0 ? (
                    jobs.map((job) => (
                        <div key={job._id} className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Briefcase className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{job.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
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
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                                        {job.description}
                                    </p>

                                    {job.required_skills && job.required_skills.length > 0 && (
                                        <div className="flex gap-2 flex-wrap mt-3">
                                            {job.required_skills.map((skill, idx) => (
                                                <span key={idx} className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleEdit(job)}
                                        className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                                        title="Edit job"
                                    >
                                        <Edit className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(job._id)}
                                        className="p-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors"
                                        title="Delete job"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-card rounded-xl border border-border p-12 text-center">
                        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-semibold mb-1">No Job Postings</h3>
                        <p className="text-sm text-muted-foreground">Create your first job posting to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}
