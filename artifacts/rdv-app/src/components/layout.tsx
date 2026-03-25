import * as React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, Calendar, Users, MonitorPlay, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organizations", label: "Organisations", icon: Building2 },
  { href: "/appointments", label: "Rendez-vous", icon: Calendar },
  { href: "/queue", label: "File d'attente", icon: Users },
  { href: "/call-screen-setup", label: "Écran d'appel", icon: MonitorPlay },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-bold text-xl text-slate-900">WaitLess</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-30 bg-white pt-20 px-4"
          >
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = location.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-4 rounded-xl font-medium transition-all",
                      isActive 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-10 glass-panel">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-blue-400 p-2 rounded-xl shadow-lg shadow-primary/20">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 filter brightness-0 invert" />
          </div>
          <span className="font-display font-bold text-2xl text-slate-900">WaitLess</span>
        </div>
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <div className="px-4 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Menu Principal</div>
          {NAV_ITEMS.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/25 translate-x-1" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
              A
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Admin User</p>
              <p className="text-xs text-slate-500">Tunis, TN</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden">
        <motion.div 
          key={location}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 sm:p-8 md:p-10 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
