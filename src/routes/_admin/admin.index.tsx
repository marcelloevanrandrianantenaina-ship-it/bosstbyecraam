import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, ShoppingCart, Wallet, TrendingUp, Package, Megaphone,
  Settings2, RefreshCcw, Calendar, AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_admin/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [s, setS] = useState<any>(null);
  const [spin, setSpin] = useState(false);

  async function load() {
    setSpin(true);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const week = new Date(Date.now() - 7 * 86400000);
    const month = new Date(Date.now() - 30 * 86400000);
    const [{ data: orders }, { count: users }, { count: pending }, { count: servicesCount }] = await Promise.all([
      supabase.from("orders").select("total_price, status, created_at"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("recharges").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("services").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);
    const rows = orders ?? [];
    const sum = (r: any[]) => r.reduce((a, x) => a + Number(x.total_price ?? 0), 0);
    setS({
      users: users ?? 0,
      services: servicesCount ?? 0,
      pendingRecharges: pending ?? 0,
      dayRev: sum(rows.filter((r) => new Date(r.created_at) >= today)),
      weekRev: sum(rows.filter((r) => new Date(r.created_at) >= week)),
      monthRev: sum(rows.filter((r) => new Date(r.created_at) >= month)),
      totalRev: sum(rows),
      active: rows.filter((r) => r.status === "in_progress" || r.status === "pending").length,
      totalOrders: rows.length,
    });
    setTimeout(() => setSpin(false), 400);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4 fade-in">
      <PageHeader
        eyebrow="Admin Console"
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité"
        icon={TrendingUp}
        action={
          <button
            onClick={load}
            aria-label="Actualiser"
            className="h-9 w-9 rounded-xl glass border border-white/10 grid place-items-center hover:border-accent/40 transition active:scale-95"
          >
            <RefreshCcw className={`h-4 w-4 text-accent ${spin ? "spin-slow" : ""}`} />
          </button>
        }
      />

      <section className="rounded-2xl glass-strong border border-primary/20 px-4 py-3 glow-soft text-center">
        <div className="text-[10px] uppercase tracking-wider text-accent font-bold">Revenu total</div>
        <div className="text-2xl font-black mt-0.5 text-gradient">
          {s ? formatPrice(s.totalRev) : "—"}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          Sur {s?.totalOrders ?? 0} commande(s)
        </div>
      </section>

      {s?.pendingRecharges > 0 && (
        <Link
          to="/admin/recharges"
          className="block rounded-2xl border border-primary/40 bg-primary/10 p-3 glow-soft active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center text-primary-foreground">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black">{s.pendingRecharges} dépôt(s) en attente</div>
              <div className="text-[11px] text-muted-foreground">Cliquez pour valider</div>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {s === null
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
          : (
            <>
              <Stat label="Bénéfice du jour" value={formatPrice(s.dayRev)} icon={TrendingUp} accent />
              <Stat label="Semaine" value={formatPrice(s.weekRev)} icon={Calendar} />
              <Stat label="Mois" value={formatPrice(s.monthRev)} icon={Calendar} />
              <Stat label="Clients" value={String(s.users)} icon={Users} />
              <Stat label="Cmd. actives" value={String(s.active)} icon={ShoppingCart} />
              <Stat label="Services actifs" value={String(s.services)} icon={Package} />
            </>
          )}
      </div>

      <section className="pt-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Raccourcis</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickLink to="/admin/services" icon={Package} label="Services" />
          <QuickLink to="/admin/recharges" icon={Wallet} label="Dépôts" badge={s?.pendingRecharges || 0} />
          <QuickLink to="/admin/users" icon={Users} label="Utilisateurs" />
          <QuickLink to="/admin/announcements" icon={Megaphone} label="Annonces" />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <div className={`glass rounded-2xl p-3 flex items-center gap-3 ${accent ? "border-glow glow-soft" : "border border-white/10"}`}>
      <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center shrink-0 text-primary-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{label}</div>
        <div className={`font-black leading-none mt-0.5 ${accent ? "text-gradient text-lg" : "text-base"}`}>{value}</div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, badge }: { to: any; icon: any; label: string; badge?: number }) {
  return (
    <Link
      to={to}
      className="relative glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-white/10 hover:border-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all"
    >
      <div className="h-11 w-11 rounded-2xl gradient-primary grid place-items-center text-primary-foreground glow-soft">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-bold">{label}</span>
      {badge && badge > 0 ? (
        <span className="absolute top-1.5 right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black grid place-items-center">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
