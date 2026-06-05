import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus, Package, Facebook, Instagram, Music2, Search, Loader2,
} from "lucide-react";
import { ServiceCard, type Service } from "@/components/ServiceCard";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_admin/admin/services")({
  component: ServicesAdmin,
});

type Platform = "facebook" | "tiktok" | "instagram";

const TABS: { id: Platform; label: string; icon: any }[] = [
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "instagram", label: "Instagram", icon: Instagram },
];

function emptyService(): any {
  return {
    platform: "facebook",
    name: "",
    description: "",
    price_per_1k: 1000,
    supplier_price_per_1k: 800,
    min_quantity: 100,
    max_quantity: 100000,
    estimated_time: "1h",
    badge: "none",
    is_active: true,
    available: true,
    sort_order: 0,
    discount_pct: 0,
    popularity_pct: 85,
  };
}

function ServicesAdmin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [q, setQ] = useState("");

  async function load() {
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("platform")
      .order("sort_order");
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save(s: any) {
    setBusy(true);
    const payload = {
      platform: s.platform,
      name: s.name,
      description: s.description || null,
      price_per_1k: Number(s.price_per_1k),
      supplier_price_per_1k: Number(s.supplier_price_per_1k ?? 0),
      min_quantity: Number(s.min_quantity ?? 100),
      max_quantity: Number(s.max_quantity ?? 100000),
      estimated_time: s.estimated_time || "1h",
      badge: s.badge ?? "none",
      is_active: s.is_active !== false,
      sort_order: Number(s.sort_order ?? 0),
      discount_pct: Math.max(0, Math.min(90, Number(s.discount_pct ?? 0))),
      popularity_pct: Math.max(0, Math.min(100, Number(s.popularity_pct ?? 85))),
      available: s.available !== false,
    };
    const { error } = s.id
      ? await supabase.from("services").update(payload).eq("id", s.id)
      : await supabase.from("services").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(s.id ? "Service modifié" : "Service ajouté");
    setEditing(null);
    load();
  }

  async function del(s: Service) {
    if (!confirm(`Supprimer « ${s.name} » ?`)) return;
    const { error } = await supabase.from("services").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Supprimé");
    load();
  }

  const filtered = (rows ?? []).filter(
    (s) => s.platform === platform && (!q || s.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-4 fade-in">
      <PageHeader
        eyebrow="Catalogue"
        title="Services"
        subtitle="Facebook · TikTok · Instagram"
        icon={Package}
        action={
          <Button
            onClick={() => setEditing(emptyService())}
            className="gradient-primary text-primary-foreground glow-soft"
          >
            <Plus className="h-4 w-4 mr-1.5" />Ajouter
          </Button>
        }
      />

      <section className="flex items-center justify-center gap-5 py-1">
        {TABS.map((t) => {
          const active = platform === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setPlatform(t.id)}
              aria-pressed={active}
              className="group flex flex-col items-center gap-1.5 focus:outline-none"
            >
              <span
                className={[
                  "relative grid place-items-center rounded-full transition-all duration-300 ease-out active:scale-95",
                  active
                    ? "h-14 w-14 gradient-primary text-primary-foreground scale-110 shadow-[0_0_28px_-4px_oklch(0.78_0.17_65_/_0.8)] ring-2 ring-primary/50"
                    : "h-12 w-12 glass-strong border border-white/10 text-muted-foreground group-hover:text-foreground group-hover:border-primary/30",
                ].join(" ")}
              >
                <t.icon className={active ? "h-6 w-6" : "h-5 w-5"} />
              </span>
              <span className={`text-[10px] font-bold tracking-wide ${active ? "text-primary" : "text-muted-foreground"}`}>
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
        {rows === null ? (
          <div className="grid grid-cols-2 gap-3 auto-rows-fr">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-3xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">
            Aucun service pour cette catégorie. Cliquez sur <span className="text-primary font-bold">Ajouter</span> pour en créer un.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 auto-rows-fr">
            {filtered.map((s) => (
              <div key={s.id} className="relative">
                <ServiceCard
                  s={s as Service}
                  adminMode
                  onEdit={(svc) => setEditing(rows.find((r) => r.id === svc.id))}
                  onDelete={del}
                />
                {!s.is_active && (
                  <span className="absolute bottom-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground border border-white/10">
                    Inactif
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier le service" : "Nouveau service"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Nom</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2"><Label>Description</Label>
                <Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1" />
              </div>
              <div><Label>Plateforme</Label>
                <Select value={editing.platform} onValueChange={(v) => setEditing({ ...editing, platform: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Badge</Label>
                <Select value={editing.badge ?? "none"} onValueChange={(v) => setEditing({ ...editing, badge: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    <SelectItem value="top">🔥 Top</SelectItem>
                    <SelectItem value="new">⭐ Ultra</SelectItem>
                    <SelectItem value="fast">⚡ Rapide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Prix /1k (Ar)</Label>
                <Input type="number" value={editing.price_per_1k} onChange={(e) => setEditing({ ...editing, price_per_1k: e.target.value })} className="mt-1" />
              </div>
              <div><Label>Coût fournisseur /1k</Label>
                <Input type="number" value={editing.supplier_price_per_1k ?? 0} onChange={(e) => setEditing({ ...editing, supplier_price_per_1k: e.target.value })} className="mt-1" />
              </div>
              <div><Label>Qté min</Label>
                <Input type="number" value={editing.min_quantity ?? 100} onChange={(e) => setEditing({ ...editing, min_quantity: e.target.value })} className="mt-1" />
              </div>
              <div><Label>Qté max</Label>
                <Input type="number" value={editing.max_quantity ?? 100000} onChange={(e) => setEditing({ ...editing, max_quantity: e.target.value })} className="mt-1" />
              </div>
              <div><Label>Délai</Label>
                <Input value={editing.estimated_time ?? "1h"} onChange={(e) => setEditing({ ...editing, estimated_time: e.target.value })} className="mt-1" />
              </div>
              <div><Label>Ordre tri</Label>
                <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} className="mt-1" />
              </div>
              <div><Label>Promo %</Label>
                <Input type="number" min={0} max={90} value={editing.discount_pct ?? 0} onChange={(e) => setEditing({ ...editing, discount_pct: e.target.value })} className="mt-1" />
              </div>
              <div><Label>Popularité %</Label>
                <Input type="number" min={0} max={100} value={editing.popularity_pct ?? 85} onChange={(e) => setEditing({ ...editing, popularity_pct: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2 flex items-center justify-between glass rounded-xl p-3">
                <Label>Actif (visible dans le catalogue)</Label>
                <Switch checked={editing.is_active !== false} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </div>
              <div className="col-span-2 flex items-center justify-between glass rounded-xl p-3">
                <Label>Disponible (commandable)</Label>
                <Switch checked={editing.available !== false} onCheckedChange={(v) => setEditing({ ...editing, available: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={() => save(editing)} disabled={busy} className="gradient-primary text-primary-foreground">
              {busy && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
