import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RefreshCcw, Users, ShoppingBag, Search, Facebook, Instagram, Music2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { ServiceCard, type Service } from "@/components/ServiceCard";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Index,
});

type Platform = "facebook" | "tiktok" | "instagram";

const TABS: { id: Platform; label: string; icon: any }[] = [
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "instagram", label: "Instagram", icon: Instagram },
];

function Index() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[] | null>(null);
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [q, setQ] = useState("");
  const [stats, setStats] = useState<{ users: number; orders: number }>({ users: 0, orders: 0 });
  const [spin, setSpin] = useState(false);

  async function load() {
    setSpin(true);
    const [{ data: svc }, { count: uCount }, { count: oCount }] = await Promise.all([
      supabase.from("services").select("id, name, description, price_per_1k, estimated_time, badge, platform")
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
    <div className="min-h-screen pb-24">
      <AppHeader />
      <AnnouncementBar />

      <main className="mx-auto max-w-6xl px-3 pt-4 space-y-4 fade-in">
        {/* Community banner — Malagasy */}
        <section className="rounded-2xl glass-strong border border-primary/20 px-4 py-3 glow-soft text-center">
          <div className="text-[10px] uppercase tracking-wider text-accent font-bold">Vondrom-piaraha-monina</div>
          <div className="text-sm font-black mt-0.5">
            Efa mahery ny <span className="text-gradient">{stats.users.toLocaleString("fr-FR")}</span> olona mampiasa ity plateforme ity
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3">
          <StatPill icon={Users} label="Clients actifs" value={stats.users.toLocaleString("fr-FR")} accent />
          <StatPill icon={ShoppingBag} label="Commandes" value={stats.orders.toLocaleString("fr-FR")} />
        </section>

        {/* Services header */}
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

        {/* Platform tabs */}
        <section className="grid grid-cols-3 gap-2">
          {TABS.map((t) => {
            const active = platform === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setPlatform(t.id)}
                className={[
                  "h-11 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all active:scale-95",
                  active
                    ? "gradient-primary text-primary-foreground glow-soft"
                    : "glass border border-white/10 text-muted-foreground hover:border-accent/30 hover:text-foreground",
                ].join(" ")}
              >
                <t.icon className="h-4 w-4" />{t.label}
              </button>
            );
          })}
        </section>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un service…"
            className="pl-9 h-10 rounded-2xl glass border-white/10"
          />
        </div>

        {/* Services grid */}
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
            <div className="grid grid-cols-2 gap-3 auto-rows-fr">
              {filtered.map((s) => <ServiceCard key={s.id} s={s} />)}
            </div>
          )}
        </section>

        {/* CTA guest */}
        {!user && (
          <section className="rounded-3xl glass-strong border border-accent/20 p-5 text-center glow-soft">
            <div className="text-sm text-muted-foreground">Nouveau ici ?</div>
            <div className="mt-1 text-lg font-black text-gradient">Crée ton compte en 30 secondes</div>
            <p className="mt-1 text-xs text-muted-foreground">Recharge, commande et suis tes boosts en temps réel.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/auth" className="h-11 rounded-2xl gradient-primary text-primary-foreground font-bold grid place-items-center">Connexion</Link>
              <Link to="/auth" className="h-11 rounded-2xl glass border border-white/10 font-bold grid place-items-center">Créer un compte</Link>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-6 pb-2 text-center text-[11px] text-muted-foreground">
          <div className="font-bold text-foreground/80">ẞoost-by Ecr_aaM © 2026</div>
          <div className="mt-1">⚡ Service disponible 24h/24</div>
        </footer>
      </main>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`glass rounded-2xl p-3 flex items-center gap-3 ${accent ? "border-glow glow-soft" : "border border-white/10"}`}>
      <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center shrink-0">
        <Icon className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{label}</div>
        <div className={`font-black leading-none mt-0.5 ${accent ? "text-gradient text-lg" : "text-base"}`}>{value}</div>
      </div>
    </div>
  );
}
