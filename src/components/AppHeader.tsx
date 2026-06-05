import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LogIn, Wallet, Zap, LogOut, UserCircle2,
  Menu, ShoppingBag, MessageCircle, X, Crown, Home,
  Shield, LayoutDashboard, Package, Users as UsersIcon, Settings2, Megaphone,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const CLIENT_NAV = [
  { to: "/app", label: "Accueil", icon: Home },
  { to: "/profile", label: "Mon profil", icon: UserCircle2 },
  { to: "/orders", label: "Mes commandes", icon: ShoppingBag },
  { to: "/recharge", label: "Recharger", icon: Wallet },
] as const;

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/services", label: "Services", icon: Package },
  { to: "/admin/recharges", label: "Dépôts", icon: Wallet },
  { to: "/admin/users", label: "Utilisateurs", icon: UsersIcon },
  { to: "/admin/announcements", label: "Annonces", icon: Megaphone },
  { to: "/admin/settings", label: "Paramètres", icon: Settings2 },
] as const;

export function AppHeader({ admin = false }: { admin?: boolean }) {
  const { user, profile, signOut } = useAuth();
  const { settings } = useSiteSettings();
  const waDigits = (settings.whatsapp_intl || settings.whatsapp_number || "").replace(/[^0-9]/g, "");
  const navigate = useNavigate();
  const [time, setTime] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = () => setTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    t();
    const i = setInterval(t, 30000);
    return () => clearInterval(i);
  }, []);

  const close = () => setOpen(false);

  async function logoutAdmin() {
    if (typeof window !== "undefined") sessionStorage.removeItem("admin_gate_passed");
    await signOut();
    navigate({ to: "/admin/login" });
  }
  async function logoutClient() {
    await signOut();
    navigate({ to: "/auth" });
  }

  const homeTo = admin ? "/admin" : "/app";
  const badgeLabel = admin ? "ADMIN" : "PRO";
  const BadgeIcon = admin ? Shield : Crown;

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border/60">
      <div className="mx-auto max-w-6xl px-3 h-14 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link to={homeTo} className="flex items-center gap-2 min-w-0">
            <div className="relative h-8 w-8 rounded-xl gradient-primary grid place-items-center glow-soft shrink-0">
              <Zap className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="leading-tight min-w-0 hidden xs:block sm:block">
              <div className="text-[12px] font-black tracking-tight truncate flex items-center gap-1">
                <span className="text-gradient">{settings.site_name}</span>
                <span className="inline-flex items-center gap-0.5 px-1 py-px rounded text-[8px] font-black bg-primary/15 text-primary border border-primary/30">
                  <BadgeIcon className="h-2 w-2" />{badgeLabel}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.16_155)] pulse-dot" />
                <span className="truncate">{admin ? "Admin Console" : "Online"}</span>
              </div>
            </div>
          </Link>
          {user && !admin && (
            <Link
              to="/recharge"
              className="ml-1 inline-flex items-center gap-1 px-2 h-7 rounded-lg border border-primary/30 bg-primary/10 text-[11px] font-black text-primary glow-soft active:scale-95"
            >
              <Wallet className="h-3 w-3" />
              {Math.round(profile?.balance ?? 0)} Ar
            </Link>
          )}
        </div>

        <div className="px-2 h-8 rounded-full glass border border-white/10 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-foreground/80">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          {time}
        </div>

        <div className="flex items-center justify-end gap-1 shrink-0">
          {!user && !admin && (
            <Button asChild size="sm" className="h-8 px-3 text-xs gradient-primary text-primary-foreground hover:opacity-90 glow-soft">
              <Link to="/auth"><LogIn className="h-3.5 w-3.5 mr-1" />Connexion</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Menu"
                className="h-9 w-9 rounded-xl glass border border-white/10 grid place-items-center hover:border-primary/40 active:scale-95"
              >
                <Menu className="h-4 w-4 text-primary" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm p-0 border-l border-border/60 bg-card">
              <div className="p-4 border-b border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center glow-soft">
                    <Zap className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-black text-gradient">{settings.site_name}</div>
                    <div className="text-[10px] text-muted-foreground">{admin ? "Admin Console" : "Menu principal"}</div>
                  </div>
                </div>
                <button onClick={close} className="h-8 w-8 rounded-lg hover:bg-white/5 grid place-items-center"><X className="h-4 w-4" /></button>
              </div>

              {user && !admin && (
                <div className="p-4">
                  <div className="rounded-2xl glass border border-primary/20 p-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center overflow-hidden">
                      {profile?.avatar_url
                        ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                        : <UserCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{profile?.full_name || user.email}</div>
                      <div className="text-[10px] text-muted-foreground">Solde</div>
                      <div className="text-sm font-black text-gradient">{Math.round(profile?.balance ?? 0)} Ar</div>
                    </div>
                  </div>
                </div>
              )}

              <nav className="p-3 space-y-1.5">
                {admin
                  ? ADMIN_NAV.map((n) => (
                      <MenuLink key={n.to} to={n.to} icon={n.icon} label={n.label} onClick={close} />
                    ))
                  : user && CLIENT_NAV.map((n) => (
                      <MenuLink key={n.to} to={n.to} icon={n.icon} label={n.label} onClick={close} />
                    ))}
                {!admin && waDigits && (
                  <a
                    href={`https://wa.me/${waDigits}`}
                    target="_blank" rel="noopener noreferrer" onClick={close}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 active:scale-[0.98] transition"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[oklch(0.74_0.16_155_/_0.15)] grid place-items-center">
                      <MessageCircle className="h-4 w-4 text-[oklch(0.74_0.16_155)]" />
                    </div>
                    <span className="text-sm font-semibold flex-1">Support WhatsApp</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[oklch(0.74_0.16_155_/_0.15)] text-[oklch(0.74_0.16_155)] border border-[oklch(0.74_0.16_155_/_0.3)]">24/7</span>
                  </a>
                )}
                {admin && (
                  <MenuLink to="/app" icon={Home} label="Voir le site client" onClick={close} />
                )}
              </nav>

              <div className="p-3 mt-2 border-t border-border/60">
                {user ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={async () => { close(); if (admin) { await logoutAdmin(); } else { await logoutClient(); } }}
                  >
                    <LogOut className="h-4 w-4" />Déconnexion
                  </Button>
                ) : (
                  <Button asChild className="w-full gradient-primary text-primary-foreground font-bold">
                    <Link to="/auth" onClick={close}><LogIn className="h-4 w-4 mr-2" />Connexion / Inscription</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {admin && (
        <nav className="mx-auto max-w-6xl px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
          {ADMIN_NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: (n as any).exact }}
              activeProps={{ className: "gradient-primary text-primary-foreground glow-soft" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-white/5" }}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-bold transition-all"
            >
              <n.icon className="h-3.5 w-3.5" />{n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function MenuLink({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 active:scale-[0.98] transition"
    >
      <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center"><Icon className="h-4 w-4 text-primary" /></div>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}
