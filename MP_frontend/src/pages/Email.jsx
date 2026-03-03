import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Mail, Mail as MailIcon, Send, Trash2, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api, transformApplicationToApplicant } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const templates = [
  {
    id: "1",
    name: "Interview Invitation",
    subject: "Interview Invitation - Tecnoprism",
    type: "Automated",
    body: "Hi {{applicant_name}},\n\nWe were impressed by your application for the {{role}} position and would like to invite you for an interview.\n\nPlease let us know your availability for the coming week.\n\nBest regards,\nRecruiting Team",
  },
  {
    id: "2",
    name: "Rejection Email",
    subject: "Update regarding your application - Tecnoprism",
    type: "Manual",
    body: "Hi {{applicant_name}},\n\nThank you for your interest in the {{role}} position at Tecnoprism.\n\nAfter careful consideration, we have decided to move forward with other applicants.\n\nWe wish you all the best.\n\nBest regards,\nRecruiting Team",
  },
  {
    id: "3",
    name: "Offer Letter",
    subject: "Job Offer - {{role}} - Tecnoprism",
    type: "Manual",
    body: "Hi {{applicant_name}},\n\nWe are delighted to offer you the position of {{role}} at Tecnoprism.\n\nPlease review the attached offer letter and let us know your decision.\n\nBest regards,\nRecruiting Team",
  },
  {
    id: "4",
    name: "Application Received",
    subject: "Application Received - Tecnoprism",
    type: "Automated",
    body: "Hi {{applicant_name}},\n\nThank you for applying for the {{role}} position at Tecnoprism.\n\nWe have received your application and will review it shortly.\n\nBest regards,\nRecruiting Team",
  },
];

export default function EmailPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [emailSubject, setEmailSubject] = useState(selectedTemplate.subject);
  const [emailBody, setEmailBody] = useState(selectedTemplate.body);
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
    loadSentEmails();
  }, []);

  useEffect(() => {
    setEmailSubject(selectedTemplate.subject);
    setEmailBody(selectedTemplate.body);
  }, [selectedTemplate]);

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

  const loadSentEmails = () => {
    const saved = localStorage.getItem("ats-sent-emails");
    if (saved) {
      setSentEmails(JSON.parse(saved));
    }
  };

  const saveSentEmails = (emails) => {
    localStorage.setItem("ats-sent-emails", JSON.stringify(emails));
  };

  const replacePlaceholders = (text, applicant) => {
    return text
      .replace(/\{\{applicant_name\}\}/g, applicant.name)
      .replace(/\{\{role\}\}/g, applicant.role)
      .replace(/\{\{company_name\}\}/g, "Tecnoprism");
  };

  const handleSendEmail = () => {
    if (!selectedApplicant) {
      alert("Please select an applicant to send email to");
      return;
    }

    const finalSubject = replacePlaceholders(emailSubject, selectedApplicant);
    const finalBody = replacePlaceholders(emailBody, selectedApplicant);

    const newEmail = {
      id: Date.now().toString(),
      to: selectedApplicant.name,
      toEmail: selectedApplicant.email,
      applicantAvatar: selectedApplicant.avatar,
      type: selectedTemplate.name,
      subject: finalSubject,
      body: finalBody,
      time: new Date().toISOString(),
      status: "Sent",
    };

    const updatedEmails = [newEmail, ...sentEmails];
    setSentEmails(updatedEmails);
    saveSentEmails(updatedEmails);

    alert(`Email sent to ${selectedApplicant.name}!`);
    setSelectedApplicant(null);
  };

  const handleDeleteEmail = (emailId) => {
    const updatedEmails = sentEmails.filter(e => e.id !== emailId);
    setSentEmails(updatedEmails);
    saveSentEmails(updatedEmails);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Automation</h1>
          <p className="text-muted-foreground">Manage templates and send emails to applicants</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{sentEmails.length} emails sent</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Templates</h2>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTemplate.id === t.id
                ? "border-primary bg-primary/5 shadow-elevated"
                : "border-border bg-card hover:border-primary/30"
                }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{t.name}</p>
                <StatusBadge status={t.type} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t.subject}</p>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Selection */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h2 className="font-semibold mb-4">Select Applicant</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading applicants...</p>
            ) : applicants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applicants available</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {applicants.map((applicant) => (
                  <button
                    key={applicant.id}
                    onClick={() => setSelectedApplicant(applicant)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedApplicant?.id === applicant.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                      }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {applicant.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">{applicant.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{applicant.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Email Editor */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Compose Email</h2>
              <Button onClick={handleSendEmail} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Email
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  To: {selectedApplicant ? selectedApplicant.name : "Select an applicant"}
                </label>
                {selectedApplicant && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedApplicant.email}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mt-1"
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Body</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="mt-1 w-full px-3 py-3 bg-background border border-border rounded-lg text-sm min-h-[200px] resize-y"
                  placeholder="Email body"
                />
              </div>
              <div className="flex gap-2">
                {["{{applicant_name}}", "{{role}}", "{{company_name}}"].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-accent rounded-lg text-xs text-accent-foreground">
                    {tag}
                  </span>
                ))}
              </div>
              {selectedApplicant && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
                  <p className="text-sm font-medium">{replacePlaceholders(emailSubject, selectedApplicant)}</p>
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                    {replacePlaceholders(emailBody, selectedApplicant).substring(0, 150)}...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h2 className="font-semibold mb-4">Recent Activity ({sentEmails.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sentEmails.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No emails sent yet</p>
              ) : (
                sentEmails.map((email) => (
                  <div key={email.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-success/10 text-success text-xs font-bold">
                        {email.applicantAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">To: {email.to}</p>
                      <p className="text-xs text-muted-foreground truncate">{email.type}</p>
                      <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{getTimeAgo(email.time)}</p>
                      <StatusBadge status={email.status} />
                    </div>
                    <button
                      onClick={() => handleDeleteEmail(email.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      title="Delete email"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
