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
{/* Hero Premium */}
<section className="relative px-4 pt-14 pb-14 overflow-hidden">

  <div
    className="absolute inset-0 -z-10 opacity-90"
    style={{ background: "var(--gradient-radial-glow)" }}
  />

  <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-cyan-400/20 blur-3xl" />

  <div className="mx-auto max-w-5xl text-center fade-in">

    <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border-glow glow-soft">
      <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
      <span className="text-xs font-bold uppercase tracking-widest text-accent">
        Boost Premium • En ligne 24/7
      </span>
    </div>

    <h1 className="mt-8 text-5xl sm:text-7xl font-black tracking-tight leading-[0.95]">
      Faites exploser
      <span className="block text-gradient mt-2">
        votre audience
      </span>
    </h1>

    <p className="mt-5 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
      Likes • Followers • Vues • Partages premium.  
      Livraison rapide avec support instantané WhatsApp.
    </p>

    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">

      <Button
        asChild
        size="lg"
        className="gradient-primary glow text-primary-foreground rounded-2xl px-8 h-12 text-base font-bold"
      >
        <a href="#services">
          Voir les services
          <ArrowRight className="ml-2 h-5 w-5" />
        </a>
      </Button>

      {user ? (
        <Button
          asChild
          size="lg"
          variant="outline"
          className="glass border-glow rounded-2xl px-8 h-12"
        >
          <Link to="/dashboard">
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Dashboard
          </Link>
        </Button>
      ) : (
        <Button
          asChild
          size="lg"
          variant="outline"
          className="glass border-glow rounded-2xl px-8 h-12"
        >
          <Link to="/auth">
            <Rocket className="mr-2 h-5 w-5" />
            Créer un compte
          </Link>
        </Button>
      )}

    </div>

    <div className="mt-10 grid grid-cols-3 gap-3 max-w-2xl mx-auto">

      <div className="glass rounded-2xl p-4 hover-lift">
        <div className="text-2xl font-black text-gradient">
          24/7
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Disponible
        </div>
      </div>

      <div className="glass rounded-2xl p-4 hover-lift">
        <div className="text-2xl font-black text-gradient">
          +10K
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Clients satisfaits
        </div>
      </div>

      <div className="glass rounded-2xl p-4 hover-lift">
        <div className="text-2xl font-black text-gradient">
          ⚡
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Livraison rapide
        </div>
      </div>

    </div>

    <div className="mt-8 flex items-center justify-center gap-5 text-xs text-muted-foreground flex-wrap">
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheck className="h-4 w-4 text-green-400" />
        Paiement sécurisé
      </span>

      <span className="inline-flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-cyan-400" />
        Qualité premium
      </span>

      <span className="inline-flex items-center gap-1.5">
        <MessageCircle className="h-4 w-4 text-primary" />
        Support WhatsApp
      </span>
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
          <TabsList className="glass border-border/60 w-full grid grid-cols-3 mb-4 h-11">
            <TabsTrigger value="facebook" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-lg text-xs sm:text-sm">Facebook</TabsTrigger>
            <TabsTrigger value="tiktok" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-lg text-xs sm:text-sm">TikTok</TabsTrigger>
            <TabsTrigger value="instagram" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground rounded-lg text-xs sm:text-sm">Instagram</TabsTrigger>
          </TabsList>

          <TabsContent value="facebook" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
            {services === null
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-44" />)
              : fb.map((s) => <ServiceCard key={s.id} s={s} />)}
          </TabsContent>
          <TabsContent value="tiktok" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
            {services === null
              ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-44" />)
              : tt.map((s) => <ServiceCard key={s.id} s={s} />)}
          </TabsContent>
          <TabsContent value="instagram" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
            {services === null
              ? Array.from({ length: 1 }).map((_, i) => <div key={i} className="skeleton h-44" />)
              : ig.map((s) => <ServiceCard key={s.id} s={s} />)}
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 mt-8 glass">
        <div className="mx-auto max-w-6xl px-4 py-8 grid sm:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-bold"><span className="text-gradient">ẞoost</span>-by Ecr_aaM</div>
            <p className="text-xs text-muted-foreground mt-1">⚡ Site dispo 24h/24 • 7j/7</p>
            <p className="text-xs text-muted-foreground mt-3">© 2026 — Tous droits réservés</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Liens rapides</div>
            <ul className="text-sm space-y-1.5">
              <li><Link to="/" className="hover:text-accent">Accueil</Link></li>
              {user ? (
                <li><Link to="/dashboard" className="hover:text-accent">Mon compte</Link></li>
              ) : (
                <li><Link to="/auth" className="hover:text-accent">Connexion</Link></li>
              )}
              <li><Link to="/recharge" className="hover:text-accent">Recharger</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Support · {WHATSAPP_NUMBER}</div>
            <a href={waLink("Bonjour, j'ai une question")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm hover:text-accent">
              <MessageCircle className="h-4 w-4" /> WhatsApp / SMS
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
