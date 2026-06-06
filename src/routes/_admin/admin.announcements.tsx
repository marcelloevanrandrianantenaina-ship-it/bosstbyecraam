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
  Megaphone, Plus, Pencil, Trash2, Loader2, Info, AlertTriangle, CheckCircle2, Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_admin/admin/announcements")({
  component: AnnouncementsAdmin,
});

const TYPES = [
  { id: "info", label: "Info", icon: Info, cls: "bg-accent/15 text-accent border-accent/40" },
  { id: "promo", label: "Promo", icon: Sparkles, cls: "bg-primary/15 text-primary border-primary/40" },
  { id: "warning", label: "Avertissement", icon: AlertTriangle, cls: "bg-orange-500/15 text-orange-300 border-orange-400/40" },
  { id: "success", label: "Succès", icon: CheckCircle2, cls: "bg-[oklch(0.72_0.18_155_/_0.15)] text-[oklch(0.72_0.18_155)] border-[oklch(0.72_0.18_155_/_0.4)]" },
];

function typeMeta(id: string) {
  return TYPES.find((t) => t.id === id) ?? TYPES[0];
}

function emptyAnnouncement(): any {
  return {
    title: "",
    content: "",
    type: "info",
    is_active: true,
    is_pinned: false,
    sort_order: 0,
    starts_at: null,
    ends_at: null,
  };
}

function AnnouncementsAdmin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save(a: any) {
    setBusy(true);
    const payload = {
      title: a.title,
      content: a.content ?? "",
      type: a.type ?? "info",
      is_active: a.is_active !== false,
      sort_order: Number(a.sort_order ?? 0),
      starts_at: a.starts_at || null,
      ends_at: a.ends_at || null,
    };
    const { error } = a.id
      ? await supabase.from("announcements").update(payload).eq("id", a.id)
      : await supabase.from("announcements").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(a.id ? "Annonce modifiée" : "Annonce ajoutée");
    setEditing(null);
    load();
  }

  async function del(a: any) {
    if (!confirm(`Supprimer « ${a.title} » ?`)) return;
    const { error } = await supabase.from("announcements").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success("Supprimée");
    load();
  }

  async function toggleActive(a: any) {
    const { error } = await supabase
      .from("announcements")
      .update({ is_active: !a.is_active })
      .eq("id", a.id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <div className="space-y-4 fade-in">
      <PageHeader
        eyebrow="Communication"
        title="Annonces"
        subtitle="Messages affichés aux clients"
        icon={Megaphone}
        action={
          <Button
            onClick={() => setEditing(emptyAnnouncement())}
            className="gradient-primary text-primary-foreground glow-soft"
          >
            <Plus className="h-4 w-4 mr-1.5" />Ajouter
          </Button>
        }
      />

      <div className="space-y-2.5">
        {rows === null && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
        {rows !== null && rows.length === 0 && (
          <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">
            Aucune annonce. Cliquez sur <span className="text-primary font-bold">Ajouter</span> pour en créer une.
          </div>
        )}
        {rows?.map((a) => {
          const meta = typeMeta(a.type);
          const Icon = meta.icon;
          return (
            <div
              key={a.id}
              className={`relative glass rounded-2xl p-3.5 border ${a.is_active ? "border-white/10" : "border-white/5 opacity-60"}`}
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl gradient-primary grid place-items-center text-primary-foreground shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-black truncate">{a.title}</div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${meta.cls}`}>
                      {meta.label.toUpperCase()}
                    </span>
                    {!a.is_active && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-white/10">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  {a.content && (
                    <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-1.5">
                    Ordre: {a.sort_order ?? 0}
                    {a.starts_at && <> · Début: {new Date(a.starts_at).toLocaleDateString("fr-FR")}</>}
                    {a.ends_at && <> · Fin: {new Date(a.ends_at).toLocaleDateString("fr-FR")}</>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Switch checked={a.is_active} onCheckedChange={() => toggleActive(a)} />
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing(a)}
                      aria-label="Modifier"
                      className="h-7 w-7 rounded-lg glass-strong border border-primary/40 grid place-items-center text-primary hover:bg-primary/20 active:scale-95"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => del(a)}
                      aria-label="Supprimer"
                      className="h-7 w-7 rounded-lg glass-strong border border-destructive/40 grid place-items-center text-destructive hover:bg-destructive/20 active:scale-95"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier l'annonce" : "Nouvelle annonce"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Titre</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Contenu</Label>
                <Textarea rows={3} value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={editing.type ?? "info"} onValueChange={(v) => setEditing({ ...editing, type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ordre tri</Label>
                <Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Début (optionnel)</Label>
                <Input
                  type="datetime-local"
                  value={editing.starts_at ? editing.starts_at.slice(0, 16) : ""}
                  onChange={(e) => setEditing({ ...editing, starts_at: e.target.value || null })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Fin (optionnel)</Label>
                <Input
                  type="datetime-local"
                  value={editing.ends_at ? editing.ends_at.slice(0, 16) : ""}
                  onChange={(e) => setEditing({ ...editing, ends_at: e.target.value || null })}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2 flex items-center justify-between glass rounded-xl p-3">
                <Label>Active (visible)</Label>
                <Switch checked={editing.is_active !== false} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={() => save(editing)} disabled={busy || !editing?.title} className="gradient-primary text-primary-foreground">
              {busy && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
