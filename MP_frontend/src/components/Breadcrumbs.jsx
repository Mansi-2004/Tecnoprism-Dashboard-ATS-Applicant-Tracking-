import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    if (location.pathname === "/" || location.pathname === "/dashboard") {
        return null;
    }

    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                    >
                        <Home className="w-3 h-3 mr-2" />
                        Dashboard
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                    const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");

                    return (
                        <li key={to}>
                            <div className="flex items-center">
                                <ChevronRight className="w-3 h-3 text-muted-foreground mx-1" />
                                {last ? (
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest">
                                        {label}
                                    </span>
                                ) : (
                                    <Link
                                        to={to}
                                        className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                                    >
                                        {label}
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
