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

export const Route = createFileRoute("/_authenticated/profile")({
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
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-black">Mon profil</h1>
        <p className="text-xs text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <div className="glass-strong rounded-2xl p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl gradient-primary grid place-items-center glow-soft overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setAvatarUrl("")} />
          ) : (
            <UserCircle2 className="h-8 w-8 text-primary-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold truncate">{profile?.full_name ?? user?.email}</div>
          <button onClick={copyId} className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] text-accent hover:underline">
            ID: <span className="font-mono">{profile?.client_id}</span> <Copy className="h-3 w-3" />
          </button>
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-black text-primary">
            <Wallet className="h-3 w-3" /> {formatPrice(profile?.balance ?? 0)}
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
