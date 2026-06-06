import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  RefreshCcw, Users, ShoppingBag, Search, Facebook, Instagram, Music2, Wallet,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { ServiceCard, type Service } from "@/components/ServiceCard";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/constants";

export const Route = createFileRoute("/_client/app")({
  component: AppHome,
});

type Platform = "facebook" | "tiktok" | "instagram";

const TABS: { id: Platform; label: string; icon: any }[] = [
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "instagram", label: "Instagram", icon: Instagram },
];

function AppHome() {
  const { profile } = useAuth();
  const [services, setServices] = useState<Service[] | null>(null);
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [q, setQ] = useState("");
  const [stats, setStats] = useState<{ users: number; orders: number }>({ users: 0, orders: 0 });
  const [spin, setSpin] = useState(false);

  async function load() {
    setSpin(true);
    const [{ data: svc }, { count: uCount }, { count: oCount }] = await Promise.all([
      supabase.from("services").select("id, name, description, price_per_1k, estimated_time, badge, platform, discount_pct, popularity_pct, available")
        .eq("is_active", true).order("sort_order", { ascending: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
    ]);
    setServices((svc as Service[]) ?? []);
    setStats({ users: uCount ?? 0, orders: oCount ?? 0 });
    setTimeout(() => setSpin(false), 400);
  }

  useEffect(() => { load(); }, []);

  const filtered = (services ?? []).filter(
    (s) => s.platform === platform && (!q || s.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="pb-24">
      <main className="mx-auto max-w-6xl px-3 pt-4 space-y-4 fade-in">
        {/* Balance hero */}
        <section className="rounded-3xl gradient-emerald p-0.5 glow">
          <div className="rounded-[22px] bg-background/85 px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-primary font-black">Solde</div>
              <div className="text-2xl font-black text-emerald-grad leading-none mt-1">
                {formatPrice(profile?.balance ?? 0)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">Client #{profile?.client_id ?? "—"}</div>
            </div>
            <Link
              to="/recharge"
              className="shrink-0 inline-flex items-center gap-1.5 h-11 px-4 rounded-2xl gradient-cyan text-accent-foreground font-black text-sm glow-cyan active:scale-95"
            >
              <Wallet className="h-4 w-4" /> Recharger
            </Link>
          </div>
        </section>

        <AnnouncementBanner />

        <section className="grid grid-cols-2 gap-3">
          <StatPill icon={Users} label="Clients actifs" value={stats.users.toLocaleString("fr-FR")} variant="emerald" />
          <StatPill icon={ShoppingBag} label="Commandes" value={stats.orders.toLocaleString("fr-FR")} variant="cyan" />
        </section>

        <section className="flex items-center justify-between pt-1">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Catalogue</div>
            <h2 className="text-lg font-black">Nos services premium</h2>
          </div>
          <button
            onClick={load}
            aria-label="Actualiser"
            className="h-9 w-9 rounded-xl glass border border-white/10 grid place-items-center hover:border-accent/40 transition active:scale-95"
          >
            <RefreshCcw className={`h-4 w-4 text-accent ${spin ? "spin-slow" : ""}`} />
          </button>
        </section>

        <section className="flex items-center justify-center gap-5 py-2">
          {TABS.map((t) => {
            const active = platform === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setPlatform(t.id)}
                aria-pressed={active}
                aria-label={t.label}
                className="group flex flex-col items-center gap-1.5 focus:outline-none"
              >
                <span
                  className={[
                    "relative grid place-items-center rounded-full transition-all duration-300 ease-out active:scale-95",
                    active
                      ? "h-16 w-16 gradient-cyan text-accent-foreground scale-110 glow-cyan ring-2 ring-accent/50"
                      : "h-14 w-14 glass-strong border border-white/10 text-muted-foreground group-hover:text-foreground group-hover:border-accent/30",
                  ].join(" ")}
                >
                  <t.icon className={`transition-all ${active ? "h-7 w-7" : "h-6 w-6"}`} />
                </span>
                <span className={`text-[10px] font-bold tracking-wide transition-colors ${active ? "text-accent" : "text-muted-foreground"}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </section>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un service…"
            className="pl-9 h-10 rounded-2xl glass border-white/10"
          />
        </div>

        <section>
          {services === null ? (
            <div className="grid grid-cols-2 gap-3 auto-rows-fr">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-52 rounded-3xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">
              Aucun service disponible pour cette catégorie.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 auto-rows-fr stagger">
              {filtered.map((s) => <ServiceCard key={s.id} s={s} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatPill({
  icon: Icon, label, value, variant,
}: { icon: any; label: string; value: string; variant: "emerald" | "cyan" }) {
  const grad = variant === "emerald" ? "gradient-emerald" : "gradient-cyan";
  const txt = variant === "emerald" ? "text-emerald-grad" : "text-gradient";
  return (
    <div className="glass rounded-2xl p-3 flex items-center gap-3 border border-white/10">
      <div className={`h-9 w-9 rounded-xl ${grad} grid place-items-center shrink-0 text-primary-foreground`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{label}</div>
        <div className={`font-black leading-none mt-0.5 ${txt} text-lg`}>{value}</div>
      </div>
    </div>
  );
}
