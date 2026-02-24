import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Users, BarChart3, CalendarCheck, User, ArrowRight, Github, Chrome, UserCog, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import tecnoprismLogo from "@/assets/tecnoprism-logo.png";

const features = [
  { icon: Users, label: "Collaboration", desc: "Easily share applicant profiles with your hiring team." },
  { icon: BarChart3, label: "Analytics", desc: "Gain insights into your recruitment pipeline performance." },
  { icon: CalendarCheck, label: "Scheduling", desc: "Seamlessly schedule interviews with automated reminders." },
  { icon: ShieldCheck, label: "Compliant", desc: "Built-in tools to ensure your hiring process stays compliant." },
];

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("interviewer"); // Default role
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated and has a token, redirect to dashboard
    if (localStorage.getItem("ats-authenticated") === "true" && localStorage.getItem("ats-token")) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation for signup
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const baseUrl = "http://localhost:8000/api/v1/auth";
      let response;
      let data;

      if (isLogin) {
        // Login uses form data
        const formData = new FormData();
        formData.append("username", email);
        formData.append("password", password);

        response = await fetch(`${baseUrl}/login`, {
          method: "POST",
          body: formData,
        });
      } else {
        // Signup uses JSON
        response = await fetch(`${baseUrl}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name,
            password,
            role, // Use selected role
          }),
        });
      }

      data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      // Success
      localStorage.setItem("ats-token", data.access_token);
      localStorage.setItem("ats-role", data.role || role);
      localStorage.setItem("ats-user-name", data.name || name || email.split("@")[0]);
      if (data.profile_photo) {
        localStorage.setItem("ats-user-photo", `http://localhost:8000/${data.profile_photo.replace(/\\/g, '/')}`);
      }
      localStorage.setItem("ats-authenticated", "true");

      navigate("/");
    } catch (error) {
      console.error("Auth error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background font-sans overflow-hidden">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-[#0F1117] flex-col justify-between p-12 text-white">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2 group cursor-pointer">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xl border border-white/20 group-hover:scale-110 transition-transform duration-500">
              <img src={tecnoprismLogo} alt="Tecnoprism" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">TECNOPRISM</span>
          </div>
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] ml-1">Next-Gen Recruitment</p>
        </div>

        <div className="relative z-10 space-y-6 max-w-xl">
          <div className="space-y-4">
            <h1 className="text-6xl font-black leading-[1.1] tracking-tight">
              Master Your <br />
              <span className="text-primary italic">Hiring</span> Pipeline.
            </h1>
            <p className="text-white/60 text-xl leading-relaxed font-light">
              Experience the future of talent acquisition with our AI-powered ATS. Designed for elite teams who demand excellence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-12">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 backdrop-blur-sm">
                <div className="mb-4 p-3 rounded-2xl bg-primary/10 w-fit group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1">{label}</h3>
                <p className="text-white/40 text-sm leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <p className="text-white/30 text-xs font-medium">© 2026 Tecnoprism Technologies. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-white/30 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-white/30 hover:text-white transition-colors text-xs font-medium uppercase tracking-widest">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative bg-white dark:bg-[#0A0B0F]">
        {/* Glow effect for mobile */}
        <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center space-y-3">
            <div className="lg:hidden inline-flex items-center gap-2 mb-6 p-2 px-4 rounded-full bg-primary/10 border border-primary/20">
              <img src={tecnoprismLogo} alt="Tecnoprism" className="h-5 w-5" />
              <span className="font-bold text-sm tracking-tighter text-primary">TECNOPRISM</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-foreground">
              {isLogin ? "Welcome back" : "Join the elite"}
            </h2>
            <p className="text-muted-foreground text-base">
              {isLogin
                ? "Enter your credentials to access your dashboard"
                : "Create an account to start hiring smarter"}
            </p>
          </div>

          <div className="p-1 bg-muted rounded-2xl flex relative overflow-hidden">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-xl shadow-sm transition-all duration-500 ease-out z-0 ${!isLogin ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
            />
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 ${isLogin ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 ${!isLogin ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 group">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12 h-14 bg-muted/30 border-muted-foreground/10 focus:bg-background focus:ring-primary focus:border-primary transition-all rounded-2xl text-base font-medium"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-muted/30 border-muted-foreground/10 focus:bg-background focus:ring-primary focus:border-primary transition-all rounded-2xl text-base font-medium"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                {isLogin ? "Login As" : "Sign Up As"}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${role === "admin"
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                    : "border-muted-foreground/10 hover:border-primary/30 hover:bg-muted/30"
                    }`}
                >
                  <UserCog className={`h-6 w-6 mx-auto mb-2 ${role === "admin" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className={`text-xs font-bold ${role === "admin" ? "text-primary" : "text-muted-foreground"}`}>Admin</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("hr")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${role === "hr"
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                    : "border-muted-foreground/10 hover:border-primary/30 hover:bg-muted/30"
                    }`}
                >
                  <Briefcase className={`h-6 w-6 mx-auto mb-2 ${role === "hr" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className={`text-xs font-bold ${role === "hr" ? "text-primary" : "text-muted-foreground"}`}>HR</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("interviewer")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${role === "interviewer"
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                    : "border-muted-foreground/10 hover:border-primary/30 hover:bg-muted/30"
                    }`}
                >
                  <User className={`h-6 w-6 mx-auto mb-2 ${role === "interviewer" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className={`text-xs font-bold ${role === "interviewer" ? "text-primary" : "text-muted-foreground"}`}>Interviewer</p>
                </button>
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Security Phrase</label>
                {isLogin && (
                  <button type="button" className="text-xs font-bold text-primary hover:underline transition-all">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-muted/30 border-muted-foreground/10 focus:bg-background focus:ring-primary focus:border-primary transition-all rounded-2xl text-base font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2 group animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Identity</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 bg-muted/30 border-muted-foreground/10 focus:bg-background focus:ring-primary focus:border-primary transition-all rounded-2xl text-base font-medium"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center gap-3 ml-1 group cursor-pointer w-fit">
                <Checkbox id="remember" className="rounded-lg border-muted-foreground/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all h-5 w-5" />
                <label htmlFor="remember" className="text-sm font-semibold text-muted-foreground cursor-pointer group-hover:text-foreground transition-colors select-none">
                  Keep me signed in
                </label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? "Access Dashboard" : "Initiate Account"}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/10"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">
              <span className="bg-background px-4">Social Access</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 border-muted-foreground/10 rounded-2xl hover:bg-muted/50 hover:border-primary/20 transition-all flex items-center justify-center gap-3 group">
              <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Github</span>
            </Button>
            <Button variant="outline" className="h-12 border-muted-foreground/10 rounded-2xl hover:bg-muted/50 hover:border-primary/20 transition-all flex items-center justify-center gap-3 group">
              <Chrome className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Google</span>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Trusted by 500+ talent teams" : "Experience the power of intelligence"}
          </p>
        </div>
      </div>
    </div>
  );
}

