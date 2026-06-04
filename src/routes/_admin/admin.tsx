import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShoppingCart, Wallet, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export const Route = createFileRoute("/_admin/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [s, setS] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const week = new Date(Date.now() - 7 * 86400000);
      const month = new Date(Date.now() - 30 * 86400000);
      const [{ data: orders }, { count: users }, { count: pending }] = await Promise.all([
        supabase.from("orders").select("total_price, status, created_at"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("recharges").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      const rows = orders ?? [];
      const sum = (r: any[]) => r.reduce((a, x) => a + Number(x.total_price ?? 0), 0);
      setS({
        users: users ?? 0,
        pendingRecharges: pending ?? 0,
        dayRev: sum(rows.filter((r) => new Date(r.created_at) >= today)),
        weekRev: sum(rows.filter((r) => new Date(r.created_at) >= week)),
        monthRev: sum(rows.filter((r) => new Date(r.created_at) >= month)),
        active: rows.filter((r) => r.status === "in_progress" || r.status === "pending").length,
      });
    })();
  }, []);

  if (!s) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      <div>
        <h1 className="text-xl font-black">Tableau de bord</h1>
        <p className="text-xs text-muted-foreground">Vue d'ensemble de l'activité</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Bénéfice du jour" value={formatPrice(s.dayRev)} icon={TrendingUp} accent />
        <Stat label="Bénéfice semaine" value={formatPrice(s.weekRev)} icon={TrendingUp} />
        <Stat label="Bénéfice mois" value={formatPrice(s.monthRev)} icon={TrendingUp} />
        <Stat label="Clients" value={String(s.users)} icon={Users} />
        <Stat label="Commandes actives" value={String(s.active)} icon={ShoppingCart} />
        <Stat label="Dépôts en attente" value={String(s.pendingRecharges)} icon={Wallet} accent={s.pendingRecharges > 0} />
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <div className={`glass rounded-xl p-4 ${accent ? "border-glow glow-soft" : ""}`}>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase">
        <Icon className="h-3.5 w-3.5" />{label}
      </div>
      <div className={`mt-2 font-bold ${accent ? "text-gradient text-xl" : "text-lg"}`}>{value}</div>
    </div>
  );
}
