import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Wallet, ShoppingCart, CheckCircle2, Loader2, MessageCircle, ArrowRight, Bell } from "lucide-react";
import { formatPrice, waLink } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Stats = { total: number; completed: number; in_progress: number };
type OrderRow = { id: string; service_name: string; quantity: number; total_price: number; status: string; created_at: string };

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    pending: "bg-[oklch(0.82_0.17_85)]/15 text-[oklch(0.82_0.17_85)] border-[oklch(0.82_0.17_85)]/30",
    in_progress: "bg-primary/15 text-primary border-primary/30",
    completed: "bg-[oklch(0.72_0.18_155)]/15 text-[oklch(0.72_0.18_155)] border-[oklch(0.72_0.18_155)]/30",
    cancelled: "bg-destructive/15 text-destructive border-destructive/30",
    refunded: "bg-muted text-muted-foreground border-border",
  };
  const label: Record<string, string> = {
    pending: "🟡 En attente", in_progress: "🔵 En cours", completed: "🟢 Terminé", cancelled: "🔴 Annulé", refunded: "💸 Remboursé",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[s] ?? ""}`}>{label[s] ?? s}</span>;
}

function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, in_progress: 0 });
  const [recent, setRecent] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("id, service_name, quantity, total_price, status, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => {
        const rows = (data as OrderRow[]) ?? [];
        setRecent(rows);
        setStats({
          total: rows.length,
          completed: rows.filter((r) => r.status === "completed").length,
          in_progress: rows.filter((r) => r.status === "in_progress" || r.status === "pending").length,
        });
      });
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-5 fade-in">
      {/* Welcome */}
      <div className="glass-strong rounded-2xl p-5 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs text-muted-foreground">Bienvenue</div>
          <div className="text-xl font-bold">{profile?.full_name ?? user?.email}</div>
          <button
            onClick={() => { navigator.clipboard.writeText(profile?.client_id ?? ""); toast.success("ID copié"); }}
            className="mt-1 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            ID: <span className="font-mono">{profile?.client_id ?? "—"}</span> <Copy className="h-3 w-3" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="gradient-primary text-primary-foreground glow-soft">
            <Link to="/recharge"><Wallet className="h-4 w-4 mr-1.5" />Recharger</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Wallet} label="Solde" value={formatPrice(profile?.balance ?? 0)} accent />
        <StatCard icon={ShoppingCart} label="Commandes" value={String(stats.total)} />
        <StatCard icon={Loader2} label="En cours" value={String(stats.in_progress)} />
        <StatCard icon={CheckCircle2} label="Terminées" value={String(stats.completed)} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ActionLink to="/" label="Commander" icon={ShoppingCart} />
        <ActionLink to="/orders" label="Mes commandes" icon={CheckCircle2} />
        <ActionLink to="/recharge" label="Recharger" icon={Wallet} />
        <a href={waLink("Bonjour, j'ai besoin d'aide")} target="_blank" rel="noreferrer"
          className="glass rounded-xl px-3 py-3 flex flex-col items-center justify-center gap-1 hover-lift text-xs text-center">
          <MessageCircle className="h-4 w-4 text-[oklch(0.72_0.18_155)]" />Support
        </a>
      </div>

      {/* Recent orders */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold">Commandes récentes</h2>
            <p className="text-xs text-muted-foreground">Vos 10 dernières commandes</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/orders">Tout voir <ArrowRight className="h-3 w-3 ml-1" /></Link></Button>
        </div>
        {recent === null && <div className="space-y-2">{Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-14" />)}</div>}
        {recent && recent.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">Aucune commande pour le moment. <Link to="/" className="text-accent hover:underline">Commander</Link></div>
        )}
        {recent && recent.length > 0 && (
          <ul className="divide-y divide-border/50">
            {recent.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{r.service_name}</div>
                  <div className="text-[11px] text-muted-foreground">Qté {r.quantity} · {new Date(r.created_at).toLocaleString("fr-FR")}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold">{formatPrice(r.total_price)}</div>
                  <StatusBadge s={r.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`glass rounded-xl p-3 ${accent ? "border-glow glow-soft" : ""}`}>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />{label}
      </div>
      <div className={`mt-1 font-bold ${accent ? "text-gradient text-lg" : "text-base"}`}>{value}</div>
    </div>
  );
}

function ActionLink({ to, label, icon: Icon }: { to: string; label: string; icon: any }) {
  return (
    <Link to={to} className="glass rounded-xl px-3 py-3 flex flex-col items-center justify-center gap-1 hover-lift text-xs text-center">
      <Icon className="h-4 w-4 text-accent" />{label}
    </Link>
  );
}
