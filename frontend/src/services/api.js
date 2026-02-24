const API_BASE_URL = "http://localhost:8000/api/v1";

// Helper to get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem("ats-token");
};

// Helper to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();

    const headers = {
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
};

// API Functions
export const api = {
    // Applications
    getApplications: async () => {
        return fetchWithAuth(`${API_BASE_URL}/applications/`);
    },

    getJobApplications: async (jobId) => {
        return fetchWithAuth(`${API_BASE_URL}/applications/job/${jobId}`);
    },

    getMyApplications: async () => {
        return fetchWithAuth(`${API_BASE_URL}/applications/my-applications`);
    },

    updateApplicationStatus: async (applicationId, status) => {
        return fetchWithAuth(`${API_BASE_URL}/applications/${applicationId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        });
    },

    // Jobs
    getJobs: async () => {
        return fetchWithAuth(`${API_BASE_URL}/jobs/`);
    },

    getJob: async (jobId) => {
        return fetchWithAuth(`${API_BASE_URL}/jobs/${jobId}`);
    },

    createJob: async (jobData) => {
        return fetchWithAuth(`${API_BASE_URL}/jobs/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jobData),
        });
    },

    updateJob: async (jobId, jobData) => {
        return fetchWithAuth(`${API_BASE_URL}/jobs/${jobId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jobData),
        });
    },

    deleteJob: async (jobId) => {
        return fetchWithAuth(`${API_BASE_URL}/jobs/${jobId}`, {
            method: "DELETE",
        });
    },

    // Users
    getUsers: async () => {
        return fetchWithAuth(`${API_BASE_URL}/users/`);
    },

    getCurrentUser: async () => {
        return fetchWithAuth(`${API_BASE_URL}/users/me`);
    },

    updateProfile: async (profileData) => {
        return fetchWithAuth(`${API_BASE_URL}/users/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profileData),
        });
    },

    uploadProfilePhoto: async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/users/me/photo`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "Upload failed" }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        const data = await response.json();
        // Save the photo path to localStorage (prefix with server URL)
        const photoUrl = data.profile_photo ? `http://localhost:8000/${data.profile_photo.replace(/\\/g, '/')}` : null;
        if (photoUrl) {
            localStorage.setItem("ats-user-photo", photoUrl);
        }
        return data;
    },

    publicApply: async (jobId, file) => {
        const formData = new FormData();
        formData.append("job_id", jobId);
        formData.append("file", file);

        const response = await fetch(`${API_BASE_URL}/applications/public-apply`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "Application failed" }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    },
};

// Helper function to transform backend application data to frontend format
export const transformApplicationToApplicant = (app) => {
    // Generate avatar from applicant name
    const getAvatar = (name) => {
        if (!name) return "??";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
    };

    // Map status from backend to frontend format
    const mapStatus = (status) => {
        const statusMap = {
            "Applied": "New",
            "Under Review": "In Processing",
            "Shortlisted": "Shortlisted",
            "Interview Scheduled": "Interview",
            "Selected": "Hired",
            "Rejected": "Rejected",
        };
        return statusMap[status] || status;
    };

    return {
        id: app._id || app.id,
        name: app.applicant_name || app.candidate_name || "Unknown Applicant",
        email: app.email || app.parsed_data?.email || "N/A",
        phone: app.phone || app.parsed_data?.phone || "N/A",
        role: app.job_title || "N/A",
        location: app.parsed_data?.location || "N/A",
        skills: app.parsed_data?.skills || [],
        experience: app.parsed_data?.experience || "N/A",
        atsScore: Math.round(app.score || app.final_score || 0),
        status: mapStatus(app.status),
        appliedDate: formatDate(app.applied_at),
        avatar: getAvatar(app.applicant_name || app.candidate_name),
        profilePhoto: app.profile_photo ? `http://localhost:8000/${app.profile_photo.replace(/\\/g, '/')}` : null,
        matchDetails: {
            experienceMatch: app.scoring?.experience_match ? "Strong" : "N/A",
            educationMatch: "Match",
            keywordsMatch: app.scoring?.skill_coverage > 0.7 ? "High" : app.scoring?.skill_coverage > 0.4 ? "Medium" : "Low",
        },
        requiredSkills: (app.scoring?.matched_skills || []).map(skill => ({
            name: skill,
            matched: true,
        })).concat((app.scoring?.missing_skills || []).map(skill => ({
            name: skill,
            matched: false,
        }))),
        interviewRounds: [],
    };
};

export default api;
