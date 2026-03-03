import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Zap, Shield, Users } from "lucide-react";
import tecnoprismLogo from "@/assets/tecnoprism-logo.png";

export default function Landing() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src={tecnoprismLogo} alt="Tecnoprism" className="h-8 w-8" />
                    <span className="text-xl font-bold tracking-tight">TECNOPRISM</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <a href="#features" className="hover:text-primary transition-colors">Features</a>
                    <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
                    <Link to="/login" className="px-5 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                        Sign In
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 animate-fade-in">
                    <Zap className="h-3 w-3" />
                    <span>AI-POWERED RECRUITMENT PLATFORM</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 animate-slide-up">
                    Hire Smarter, <br />
                    <span className="text-primary italic">Faster</span>, and Better.
                </h1>
                <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    Streamline your talent acquisition with our comprehensive ATS.
                    Manage jobs, screen resumes with AI, and collaborate with your team in one place.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <Link to="/login" className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20">
                        Get Started Now
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                    <button className="px-8 py-4 rounded-2xl border border-border bg-card font-bold text-lg hover:bg-muted transition-all">
                        View Live Demo
                    </button>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-border">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to hire</h2>
                    <p className="text-muted-foreground">Powerful tools designed for modern hiring teams.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={Zap}
                        title="AI Resume Screening"
                        desc="Automatically score and rank candidates based on job requirements using advanced AI."
                    />
                    <FeatureCard
                        icon={Users}
                        title="Team Collaboration"
                        desc="Share applicant profiles, leave feedback, and move candidates through the pipeline together."
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Role-Based Access"
                        desc="Secure dashboards for Admins, HR, Recruiters, and Candidates with tailored permissions."
                    />
                </div>
            </section>

            {/* Stats/Social Proof */}
            <section className="bg-muted/50 py-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <p className="text-4xl font-bold text-primary mb-1">500+</p>
                            <p className="text-sm text-muted-foreground">Companies</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-primary mb-1">10k+</p>
                            <p className="text-sm text-muted-foreground">Applications</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-primary mb-1">98%</p>
                            <p className="text-sm text-muted-foreground">Satisfaction</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-primary mb-1">24/7</p>
                            <p className="text-sm text-muted-foreground">Support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-5xl mx-auto px-6 py-24 text-center">
                <div className="bg-[#0F1117] rounded-[40px] p-12 md:p-20 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full" />
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Start hiring better today.</h2>
                    <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto relative z-10">
                        Join the elite teams using Tecnoprism to build their dream engineering teams.
                    </p>
                    <Link to="/login" className="inline-flex px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-white/90 transition-all relative z-10">
                        Create Your Account
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 opacity-50">
                    <img src={tecnoprismLogo} alt="Tecnoprism" className="h-5 w-5" />
                    <span className="text-sm font-bold">TECNOPRISM</span>
                </div>
                <p className="text-sm text-muted-foreground">© 2026 Tecnoprism Technologies. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary">Twitter</a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary">LinkedIn</a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</a>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc }) {
    return (
        <div className="p-8 rounded-3xl bg-card border border-border shadow-card hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    );
}
