import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { ServiceCard, type Service } from "@/components/ServiceCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, ShieldCheck, Rocket, ArrowRight, MessageCircle, LayoutDashboard } from "lucide-react";
import { waLink, WHATSAPP_NUMBER } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ẞoost-by Ecr_aaM — Boost Facebook & TikTok 24/7" },
      { name: "description", content: "Boostez vos publications, vidéos et profils. Likes, vues, abonnés, partages — service premium 24h/24." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[] | null>(null);
  const [dataSaver, setDataSaver] = useState(false);

  useEffect(() => {
    supabase.from("services").select("id, name, description, price_per_1k, estimated_time, badge, platform")
      .eq("is_active", true).order("sort_order", { ascending: true })
      .then(({ data }) => setServices((data as Service[]) ?? []));
  }, []);

  const fb = services?.filter((s) => s.platform === "facebook") ?? [];
  const tt = services?.filter((s) => s.platform === "tiktok") ?? [];
  const ig = services?.filter((s) => s.platform === "instagram") ?? [];

  return (
    <div className="min-h-screen">
      <AppHeader />
      <AnnouncementBar />

      {/* Hero */}
      <section className="relative px-4 pt-10 pb-8 overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-radial-glow)" }} />
        <div className="mx-auto max-w-3xl text-center fade-in">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-accent border border-accent/30 bg-accent/10 px-2.5 py-1 rounded-full">
            <Zap className="h-3 w-3" /> Service disponible 24h/24
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Propulsez votre <span className="text-gradient">audience</span><br />
            sur Facebook & TikTok
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Likes, vues, abonnés et partages premium. Livraison rapide, prix transparents, support direct.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Button asChild size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 glow">
              <a href="#services">Voir les services <ArrowRight className="h-4 w-4 ml-1.5" /></a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border bg-card/40 backdrop-blur">
              <Link to="/auth"><Rocket className="h-4 w-4 mr-1.5" />Créer un compte</Link>
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[oklch(0.72_0.18_155)]" /> Paiement sécurisé</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-accent" /> Qualité réelle</span>
          </div>
        </div>
      </section>

      {/* Data saver */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="glass rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <Label htmlFor="ds" className="cursor-pointer">⚡ Mode économie de données</Label>
          <Switch id="ds" checked={dataSaver} onCheckedChange={setDataSaver} />
        </div>
      </div>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Nos services</h2>
            <p className="text-xs text-muted-foreground">Choisissez une catégorie ci-dessous</p>
          </div>
        </div>

        <Tabs defaultValue="facebook">
          <TabsList className="glass border-border/60 w-full grid grid-cols-2 mb-4 h-11">
            <TabsTrigger value="facebook" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-lg">Facebook</TabsTrigger>
            <TabsTrigger value="tiktok" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-lg">TikTok</TabsTrigger>
          </TabsList>

          <TabsContent value="facebook" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services === null
              ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-40" />)
              : fb.map((s) => <ServiceCard key={s.id} s={s} />)}
          </TabsContent>
          <TabsContent value="tiktok" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services === null
              ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40" />)
              : tt.map((s) => <ServiceCard key={s.id} s={s} />)}
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-8 glass">
        <div className="mx-auto max-w-6xl px-4 py-8 grid sm:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-bold"><span className="text-gradient">ẞoost</span>-by Ecr_aaM</div>
            <p className="text-xs text-muted-foreground mt-1">⚡ Service disponible 24h/24</p>
            <p className="text-xs text-muted-foreground mt-3">© 2026 — Tous droits réservés</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Liens rapides</div>
            <ul className="text-sm space-y-1.5">
              <li><Link to="/" className="hover:text-accent">Accueil</Link></li>
              <li><Link to="/auth" className="hover:text-accent">Connexion</Link></li>
              <li><Link to="/dashboard" className="hover:text-accent">Mon compte</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Support</div>
            <a href={waLink("Bonjour, j'ai une question")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm hover:text-accent">
              <MessageCircle className="h-4 w-4" /> WhatsApp Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
