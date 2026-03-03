import { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import HRDashboard from "./HRDashboard";
import CandidateDashboard from "./CandidateDashboard";

export default function Dashboard() {
  const [role, setRole] = useState(localStorage.getItem("ats-role") || "admin");

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem("ats-role"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (role === "admin") return <AdminDashboard />;
  if (role === "hr") return <HRDashboard />;
  if (role === "candidate") return <CandidateDashboard />;

  // Default to HR/Dashboard for Recruiter or other roles
  return <HRDashboard />;
}
