import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { api, transformApplicationToApplicant } from "@/services/api";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [interviews, setInterviews] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    applicantId: "",
    date: "",
    time: "",
    type: "Technical",
    interviewer: "",
    notes: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const applications = await api.getApplications();
      const transformedApplicants = applications.map(transformApplicationToApplicant);
      setApplicants(transformedApplicants);

      // Load interviews from localStorage
      const savedInterviews = localStorage.getItem("ats-interviews");
      if (savedInterviews) {
        setInterviews(JSON.parse(savedInterviews));
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = (e) => {
    e.preventDefault();

    const applicant = applicants.find(c => c.id === formData.applicantId);
    if (!applicant) return;

    const newInterview = {
      id: Date.now().toString(),
      applicantId: formData.applicantId,
      applicantName: applicant.name,
      applicantAvatar: applicant.avatar,
      applicantRole: applicant.role,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      interviewer: formData.interviewer,
      notes: formData.notes,
      status: "Scheduled",
    };

    const updatedInterviews = [...interviews, newInterview];
    setInterviews(updatedInterviews);

    // Save to localStorage
    localStorage.setItem("ats-interviews", JSON.stringify(updatedInterviews));

    // Reset form
    setFormData({
      applicantId: "",
      date: "",
      time: "",
      type: "Technical",
      interviewer: "",
      notes: "",
    });
    setShowScheduleModal(false);
  };

  const handleDeleteInterview = (interviewId) => {
    const updatedInterviews = interviews.filter(i => i.id !== interviewId);
    setInterviews(updatedInterviews);
    localStorage.setItem("ats-interviews", JSON.stringify(updatedInterviews));
  };

  const getInterviewsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return interviews.filter((i) => i.date === dateStr);
  };

  const handleDayClick = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setFormData({ ...formData, date: dateStr });
    setShowScheduleModal(true);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));
  const today = new Date();
  const isToday = (day) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const cards = [];
  for (let i = 0; i < firstDay; i++) cards.push(null);
  for (let i = 1; i <= daysInMonth; i++) cards.push(i);

  const upcomingInterviews = interviews
    .filter((i) => {
      const interviewDate = new Date(i.date);
      return interviewDate >= today && i.status === "Scheduled";
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold">Interview Schedule</h1>
        <p className="text-muted-foreground">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Interview Schedule</h1>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Schedule Interview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{monthName}</h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysOfWeek.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
            {cards.map((day, idx) => {
              const dayInterviews = day ? getInterviewsForDay(day) : [];
              return (
                <div
                  key={idx}
                  onClick={() => day && handleDayClick(day)}
                  className={`min-h-[80px] p-1.5 rounded-lg border text-sm cursor-pointer transition-all ${day
                    ? (isToday(day)
                      ? "border-primary bg-primary/5 hover:bg-primary/10"
                      : "border-transparent hover:bg-muted/50 hover:border-border")
                    : "border-transparent opacity-0 pointer-events-none"
                    }`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-medium ${isToday(day) ? "text-primary" : "text-muted-foreground"}`}>{day}</span>
                      {dayInterviews.map((interview, i) => (
                        <div key={i} className="mt-1 px-1.5 py-1 bg-primary/10 rounded text-xs text-primary truncate">
                          {interview.time} {interview.applicantName}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4">Upcoming Interviews ({upcomingInterviews.length})</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {upcomingInterviews.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming interviews scheduled.</p>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Schedule your first interview
                </button>
              </div>
            ) : (
              upcomingInterviews.map((interview) => (
                <div key={interview.id} className="p-4 rounded-lg border border-border hover:shadow-card transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{interview.applicantAvatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{interview.applicantName}</p>
                        <p className="text-xs text-muted-foreground">{interview.applicantRole}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteInterview(interview.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(interview.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {interview.time}
                    </p>
                    <p>{interview.type} Interview</p>
                    <p>Interviewer: {interview.interviewer}</p>
                    {interview.notes && <p className="text-xs italic mt-2">"{interview.notes}"</p>}
                  </div>
                  <StatusBadge status={interview.status} className="mt-2" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Schedule Interview</h2>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 rounded hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Applicant *</label>
                <select
                  value={formData.applicantId}
                  onChange={(e) => setFormData({ ...formData, applicantId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  required
                >
                  <option value="">Select an applicant</option>
                  {applicants.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Date *</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Time *</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Interview Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  required
                >
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                  <option value="Managerial">Managerial</option>
                  <option value="Cultural Fit">Cultural Fit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Interviewer *</label>
                <Input
                  value={formData.interviewer}
                  onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm min-h-[80px]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Schedule Interview
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
