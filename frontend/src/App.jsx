import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import ResumeScreening from "./pages/ResumeScreening";
import Applicants from "./pages/Applicants";
import Schedule from "./pages/Schedule";
import EmailPage from "./pages/Email";
import SettingsPage from "./pages/Settings";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem("ats-authenticated") === "true" && localStorage.getItem("ats-token");
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/resume-screening" element={<ResumeScreening />} />
                    <Route path="/applicants" element={<Applicants />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/email" element={<EmailPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
