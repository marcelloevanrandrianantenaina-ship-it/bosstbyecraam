import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDataSaver } from "@/hooks/use-data-saver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  UserCircle2, Copy, Loader2, Save, Wallet, ShoppingBag, History,
  LogOut, Mail, IdCard, Zap, ZapOff,
} from "lucide-react";
import { formatPrice } from "@/lib/constants";

export const Route = createFileRoute("/_client/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, refresh, signOut } = useAuth();
  const { enabled: dataSaver, toggle: toggleDataSaver } = useDataSaver();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null, avatar_url: avatarUrl.trim() || null })
      .eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profil mis à jour");
    refresh();
  }

  function copyId() {
    navigator.clipboard.writeText(profile?.client_id ?? "");
    toast.success("ID copié");
  }

  async function logout() {
    await signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-5 space-y-4 fade-in pb-24">
      {/* Hero */}
      <section className="glass-strong rounded-3xl p-5 flex flex-col items-center text-center gap-3 glow-soft border border-primary/25">
        <div className="relative">
          <div className="h-24 w-24 rounded-full gradient-emerald grid place-items-center overflow-hidden ring-4 ring-primary/30 glow">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setAvatarUrl("")} />
            ) : (
              <UserCircle2 className="h-12 w-12 text-primary-foreground" />
            )}
          </div>
          <span className="absolute -bottom-1 right-0 h-6 w-6 rounded-full bg-primary border-2 border-background grid place-items-center text-[10px] font-black text-primary-foreground">✓</span>
        </div>
        <div>
          <div className="text-base font-black">{profile?.full_name ?? user?.email}</div>
          <button onClick={copyId} className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-accent hover:underline">
            <IdCard className="h-3 w-3" /> ID: <span className="font-mono">{profile?.client_id}</span> <Copy className="h-3 w-3" />
          </button>
          <div className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
            <Mail className="h-3 w-3" /> {user?.email}
          </div>
        </div>
        <div className="w-full rounded-2xl gradient-emerald p-0.5">
          <div className="rounded-[14px] bg-background/80 px-4 py-3 flex items-center justify-between">
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Solde disponible</div>
              <div className="text-2xl font-black text-emerald-grad leading-none mt-1">{formatPrice(profile?.balance ?? 0)}</div>
            </div>
            <Button asChild className="gradient-cyan text-accent-foreground font-black glow-cyan h-10 px-4">
              <Link to="/recharge"><Wallet className="h-4 w-4 mr-1.5" />Recharger</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-2.5">
        <Link to="/orders" className="glass rounded-2xl p-3.5 flex items-center gap-2.5 hover:border-accent/40 border border-white/10 active:scale-[0.98] transition">
          <div className="h-9 w-9 rounded-xl gradient-cyan grid place-items-center text-accent-foreground">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Suivi</div>
            <div className="text-xs font-black truncate">Mes commandes</div>
          </div>
        </Link>
        <Link to="/recharge" className="glass rounded-2xl p-3.5 flex items-center gap-2.5 hover:border-primary/40 border border-white/10 active:scale-[0.98] transition">
          <div className="h-9 w-9 rounded-xl gradient-emerald grid place-items-center text-primary-foreground">
            <History className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Historique</div>
            <div className="text-xs font-black truncate">Mes dépôts</div>
          </div>
        </Link>
      </section>

      {/* Data saver */}
      <section className="glass rounded-2xl p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl grid place-items-center ${dataSaver ? "gradient-emerald text-primary-foreground" : "bg-muted/40 text-muted-foreground"}`}>
          {dataSaver ? <ZapOff className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black">Économiser des données</div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Désactive animations, flou, effets lumineux. Utile en connexion limitée.
          </p>
        </div>
        <Switch checked={dataSaver} onCheckedChange={toggleDataSaver} />
      </section>

      {/* Edit form */}
      <form onSubmit={save} className="glass rounded-2xl p-5 space-y-4">
        <div className="text-sm font-black">Modifier mes informations</div>
        <div>
          <Label htmlFor="name" className="text-[11px] uppercase tracking-wider text-muted-foreground">Nom affiché</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={60} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="avatar" className="text-[11px] uppercase tracking-wider text-muted-foreground">URL de la photo de profil</Label>
          <Input id="avatar" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" className="mt-1" />
        </div>
        <Button type="submit" disabled={busy} className="w-full gradient-emerald text-primary-foreground glow-soft">
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Enregistrer
        </Button>
      </form>

      <Button
        onClick={logout}
        variant="ghost"
        className="w-full justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/30 rounded-2xl h-12"
      >
        <LogOut className="h-4 w-4" /> Déconnexion
      </Button>
    </div>
  );
}
