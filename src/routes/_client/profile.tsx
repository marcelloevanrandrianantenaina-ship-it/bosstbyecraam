import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserCircle2, Copy, Loader2, Save, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export const Route = createFileRoute("/_client/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, refresh } = useAuth();
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-5 fade-in pb-24">
      <div>
        <h1 className="text-2xl font-black">Mon profil</h1>
        <p className="text-xs text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <div className="glass-strong rounded-3xl p-6 flex flex-col items-center text-center gap-3 glow-soft border border-primary/20">
        <div className="relative">
          <div className="h-24 w-24 rounded-full gradient-primary grid place-items-center glow-soft overflow-hidden ring-4 ring-primary/30 shadow-[0_0_32px_-4px_oklch(0.78_0.17_65_/_0.6)]">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setAvatarUrl("")} />
            ) : (
              <UserCircle2 className="h-12 w-12 text-primary-foreground" />
            )}
          </div>
          <span className="absolute -bottom-1 right-0 h-6 w-6 rounded-full bg-[oklch(0.72_0.18_155)] border-2 border-background grid place-items-center text-[10px] font-black text-white">✓</span>
        </div>
        <div className="min-w-0">
          <div className="text-base font-black truncate">{profile?.full_name ?? user?.email}</div>
          <button onClick={copyId} className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-accent hover:underline">
            ID: <span className="font-mono">{profile?.client_id}</span> <Copy className="h-3 w-3" />
          </button>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-black text-primary">
            <Wallet className="h-3.5 w-3.5" /> {formatPrice(profile?.balance ?? 0)}
          </div>
        </div>
      </div>

      <form onSubmit={save} className="glass rounded-2xl p-5 space-y-4">
        <div>
          <Label htmlFor="name">Nom affiché</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={60} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="avatar">URL de la photo de profil</Label>
          <Input id="avatar" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" className="mt-1" />
          <p className="text-[10px] text-muted-foreground mt-1">Collez l'URL d'une image en ligne (Imgur, etc.)</p>
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled className="mt-1 opacity-70" />
        </div>
        <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground glow-soft">
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Enregistrer
        </Button>
      </form>
    </div>
  );
}
