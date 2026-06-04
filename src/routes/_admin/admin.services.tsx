import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export const Route = createFileRoute("/_admin/admin/services")({
  component: ServicesAdmin,
});

function ServicesAdmin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [editing, setEditing] = useState<any | null>(null);

  async function load() {
    const { data } = await supabase.from("services").select("*").order("platform").order("sort_order");
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save(s: any) {
    const payload = {
      platform: s.platform, name: s.name, description: s.description ?? null,
      price_per_1k: Number(s.price_per_1k),
      supplier_price_per_1k: Number(s.supplier_price_per_1k ?? 0),
      min_quantity: Number(s.min_quantity ?? 100),
      max_quantity: Number(s.max_quantity ?? 100000),
      estimated_time: s.estimated_time ?? "1h",
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
    if (error) return toast.error(error.message);
    toast.success("Sauvegardé"); setEditing(null); load();
  }

  async function del(id: string) {
    if (!confirm("Supprimer ce service ?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimé"); load();
  }

  return (
    <div className="space-y-3 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">Services</h1>
          <p className="text-xs text-muted-foreground">Catalogue Facebook / TikTok / Instagram</p>
        </div>
        <Button
          onClick={() => setEditing({ platform: "facebook", name: "", price_per_1k: 1000, supplier_price_per_1k: 800, badge: "none", is_active: true, available: true })}
          className="gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1.5" />Nouveau
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {rows === null && Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20" />)}
        {rows?.map((s) => (
          <div key={s.id} className="glass rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] uppercase text-accent font-semibold">{s.platform}</div>
                <div className="font-semibold text-sm">{s.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {formatPrice(s.price_per_1k)} /1k · {s.is_active ? "Actif" : "Inactif"} · {s.available !== false ? "Dispo" : "Indispo"}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => setEditing(s)}><Edit className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Modifier" : "Nouveau"} service</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Nom</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="col-span-2"><Label>Description</Label><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><Label>Plateforme</Label>
                <Select value={editing.platform} onValueChange={(v) => setEditing({ ...editing, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Badge</Label>
                <Select value={editing.badge ?? "none"} onValueChange={(v) => setEditing({ ...editing, badge: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    <SelectItem value="top">🔥 Top</SelectItem>
                    <SelectItem value="new">⭐ Nouveau</SelectItem>
                    <SelectItem value="fast">⚡ Rapide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Prix /1k</Label><Input type="number" value={editing.price_per_1k} onChange={(e) => setEditing({ ...editing, price_per_1k: e.target.value })} /></div>
              <div><Label>Coût fournisseur /1k</Label><Input type="number" value={editing.supplier_price_per_1k ?? 0} onChange={(e) => setEditing({ ...editing, supplier_price_per_1k: e.target.value })} /></div>
              <div><Label>Qté min</Label><Input type="number" value={editing.min_quantity ?? 100} onChange={(e) => setEditing({ ...editing, min_quantity: e.target.value })} /></div>
              <div><Label>Qté max</Label><Input type="number" value={editing.max_quantity ?? 100000} onChange={(e) => setEditing({ ...editing, max_quantity: e.target.value })} /></div>
              <div><Label>Délai</Label><Input value={editing.estimated_time ?? "1h"} onChange={(e) => setEditing({ ...editing, estimated_time: e.target.value })} /></div>
              <div><Label>Ordre</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} /></div>
              <div><Label>Promo %</Label><Input type="number" min={0} max={90} value={editing.discount_pct ?? 0} onChange={(e) => setEditing({ ...editing, discount_pct: e.target.value })} /></div>
              <div><Label>Popularité %</Label><Input type="number" min={0} max={100} value={editing.popularity_pct ?? 85} onChange={(e) => setEditing({ ...editing, popularity_pct: e.target.value })} /></div>
              <div className="col-span-2 flex items-center justify-between glass rounded-lg p-2">
                <Label>Actif (visible)</Label>
                <Switch checked={editing.is_active !== false} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </div>
              <div className="col-span-2 flex items-center justify-between glass rounded-lg p-2">
                <Label>Disponible (commandable)</Label>
                <Switch checked={editing.available !== false} onCheckedChange={(v) => setEditing({ ...editing, available: v })} />
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => save(editing)} className="gradient-primary text-primary-foreground">Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
