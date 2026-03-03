import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Applicants from "./pages/Applicants";
import Schedule from "./pages/Schedule";
import EmailPage from "./pages/Email";
import SettingsPage from "./pages/Settings";
import Jobs from "./pages/Jobs";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Analytics from "./pages/Analytics";
import MyApplications from "./pages/MyApplications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem("ats-authenticated") === "true" && localStorage.getItem("ats-token");
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const Home = () => {
  const isAuth = localStorage.getItem("ats-authenticated") === "true" && localStorage.getItem("ats-token");
  return isAuth ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login initialIsLogin={true} />} />
          <Route path="/register" element={<Login initialIsLogin={false} />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/applicants" element={<Applicants />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/my-applications" element={<MyApplications />} />
                    <Route path="/email" element={<EmailPage />} />
                    <Route path="/users" element={<Users />} />
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
