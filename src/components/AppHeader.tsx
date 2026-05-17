import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn, LayoutDashboard, Wallet, Zap, LogOut, Shield, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export function AppHeader() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const t = () => setTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    t();
    const i = setInterval(t, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8 rounded-lg gradient-primary grid place-items-center glow-soft">
            <Zap className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight">
              <span className="text-gradient">ẞoost</span>
              <span className="text-muted-foreground">-by </span>
              <span className="text-foreground">Ecr_aaM</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.18_155)] pulse-dot" />
              En ligne · {time}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm" className="gap-1.5">
                  <Link to="/admin"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Admin</span></Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link to="/recharge"><Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">{profile ? `${Math.round(profile.balance)} Ar` : "Solde"}</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="sm:hidden">
                <Link to="/dashboard"><LayoutDashboard className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5">
                <Link to="/dashboard"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="gradient-primary text-primary-foreground hover:opacity-90 glow-soft">
              <Link to="/auth"><LogIn className="h-4 w-4 mr-1.5" />Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
