import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn, LayoutDashboard, Wallet, Zap, LogOut, Shield, UserCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const t = () => setTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    t();
    const i = setInterval(t, 30000);
    return () => clearInterval(i);
  }, []);

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border/60">
      <div className="mx-auto max-w-6xl px-3 h-12 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <div className="relative h-7 w-7 rounded-lg gradient-primary grid place-items-center glow-soft shrink-0">
            <Zap className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-[13px] font-bold tracking-tight truncate">
              <span className="text-gradient">ẞoost</span>
              <span className="text-muted-foreground">-by </span>
              <span className="text-foreground">Ecr_aaM</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.18_155)] pulse-dot" />
              <span className="truncate">En ligne · {time}</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link to="/admin" aria-label="Admin"><Shield className="h-4 w-4" /></Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm" className="h-8 px-2 gap-1.5 border border-accent/30 bg-accent/5">
                <Link to="/recharge">
                  <Wallet className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-bold text-accent">{Math.round(profile?.balance ?? 0)} Ar</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link to="/dashboard" aria-label="Tableau de bord"><LayoutDashboard className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Déconnexion"
                onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs hidden xs:inline-flex sm:inline-flex">
                <Link to="/auth"><UserCircle2 className="h-3.5 w-3.5 mr-1" />Créer un compte</Link>
              </Button>
              <Button asChild size="sm" className="h-8 px-3 text-xs gradient-primary text-primary-foreground hover:opacity-90 glow-soft">
                <Link to="/auth"><LogIn className="h-3.5 w-3.5 mr-1" />Connexion</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
