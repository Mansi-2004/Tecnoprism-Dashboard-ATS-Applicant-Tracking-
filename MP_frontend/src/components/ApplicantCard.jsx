import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";




function getScoreColor(score) {
  if (score >= 85) return "bg-success";
  if (score >= 70) return "bg-warning";
  return "bg-destructive";
}

export function ApplicantCard({ applicant, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selected
        ? "border-primary bg-primary/5 shadow-elevated"
        : "border-border bg-card hover:border-primary/30 hover:shadow-card"
        }`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {applicant.avatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm truncate">{applicant.name}</p>
            <span className="text-xs">›</span>
          </div>
          <p className="text-xs text-muted-foreground">{applicant.role}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">ATS Score</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{applicant.atsScore}%</span>
            <div className="flex-1">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getScoreColor(applicant.atsScore)}`}
                  style={{ width: `${applicant.atsScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <StatusBadge status={applicant.status} className="ml-3" />
      </div>
    </button>
  );
}
