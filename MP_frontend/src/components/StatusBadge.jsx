import { cn } from "@/lib/utils";

const statusStyles = {
  New: "bg-info/10 text-info",
  "In Processing": "bg-warning/10 text-warning",
  Shortlisted: "bg-primary/10 text-primary",
  Interview: "bg-accent text-accent-foreground",
  Hired: "bg-success/10 text-success",
  Rejected: "bg-destructive/10 text-destructive",
  Scheduled: "bg-info/10 text-info",
  Completed: "bg-success/10 text-success",
  Cancelled: "bg-muted text-muted-foreground",
  Sent: "bg-success/10 text-success",
  Failed: "bg-destructive/10 text-destructive",
  Automated: "bg-primary/10 text-primary",
  Manual: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusStyles[status] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {status}
    </span>
  );
}
