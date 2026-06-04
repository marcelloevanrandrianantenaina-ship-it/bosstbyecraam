import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Shield, LayoutDashboard, Package, Wallet, Users, Settings2, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin" || r.role === "sub_admin");
    if (!isAdmin) throw redirect({ to: "/admin/login" });
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_gate_passed") !== "1") {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/services", label: "Services", icon: Package },
  { to: "/admin/recharges", label: "Dépôts", icon: Wallet },
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/admin/settings", label: "Paramètres", icon: Settings2 },
];

function AdminLayout() {
  const navigate = useNavigate();
  async function logout() {
    sessionStorage.removeItem("admin_gate_passed");
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass-strong border-b border-border/60">
        <div className="mx-auto max-w-7xl px-3 h-14 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center glow-soft">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black truncate">Admin Console</div>
            <div className="text-[10px] text-muted-foreground truncate">ẞoost-by Ecr_aaM</div>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-8 px-2">
            <Link to="/app"><Home className="h-4 w-4" /></Link>
          </Button>
          <Button onClick={logout} variant="ghost" size="sm" className="h-8 px-2 text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <nav className="mx-auto max-w-7xl px-3 pb-2 flex gap-1.5 overflow-x-auto">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              activeProps={{ className: "gradient-primary text-primary-foreground glow-soft" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-white/5" }}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-bold transition-all"
            >
              <n.icon className="h-3.5 w-3.5" />{n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-3 sm:px-5 py-5">
        <Outlet />
      </main>
    </div>
  );
}
