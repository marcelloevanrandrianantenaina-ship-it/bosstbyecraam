import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Loader2, Plus, Trash2, Edit, Search, Wallet, ShoppingCart, Users, TrendingUp, Settings2, Check, X, LayoutDashboard, Megaphone, Package } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type SectionId = "overview" | "orders" | "recharges" | "services" | "clients" | "content";

const SECTIONS: { id: SectionId; label: string; icon: any }[] = [
  { id: "overview",  label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "orders",    label: "Commandes",      icon: ShoppingCart },
  { id: "recharges", label: "Recharges",      icon: Wallet },
  { id: "services",  label: "Services",       icon: Package },
  { id: "clients",   label: "Clients",        icon: Users },
  { id: "content",   label: "Annonces",       icon: Megaphone },
];

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<SectionId>("overview");
  useEffect(() => { if (!loading && !isAdmin) navigate({ to: "/dashboard" }); }, [isAdmin, loading, navigate]);
  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-accent" /></div>;
  if (!isAdmin) return null;

  const current = SECTIONS.find((s) => s.id === section)!;

  return (
    <div className="min-h-[calc(100vh-3rem)] mx-auto max-w-7xl px-3 sm:px-5 py-5 fade-in">
      <div className="grid lg:grid-cols-[240px_1fr] gap-5">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-16 lg:self-start">
          <div className="glass-strong rounded-3xl p-3 border border-white/10">
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center glow-soft">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black truncate">Admin Console</div>
                <div className="text-[10px] text-muted-foreground truncate">ẞoost-by Ecr_aaM</div>
              </div>
            </div>

            {/* Mobile horizontal scroll, desktop vertical */}
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-1 lg:pb-0">
              {SECTIONS.map((s) => {
                const active = section === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    className={[
                      "shrink-0 lg:w-full inline-flex items-center gap-2 px-3 h-10 rounded-2xl text-xs font-bold transition-all active:scale-95",
                      active
                        ? "gradient-primary text-primary-foreground glow-soft"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    ].join(" ")}
                  >
                    <s.icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{s.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <Link to="/dashboard" className="hidden lg:flex mt-3 items-center justify-center text-[11px] text-muted-foreground hover:text-accent transition">
            ← Retour à l'app
          </Link>
        </aside>

        {/* Content */}
        <section className="min-w-0">
          <div className="mb-4 flex items-center gap-2">
            <current.icon className="h-5 w-5 text-accent" />
            <h1 className="text-xl font-black">{current.label}</h1>
          </div>
          <div className="fade-in" key={section}>
            {section === "overview" && <Overview />}
            {section === "orders" && <OrdersAdmin />}
            {section === "recharges" && <RechargesAdmin />}
            {section === "services" && <ServicesAdmin />}
            {section === "clients" && <ClientsAdmin />}
            {section === "content" && <ContentAdmin />}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ====== OVERVIEW ====== */
function Overview() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const today = new Date(); today.setHours(0,0,0,0);
      const week = new Date(Date.now() - 7*86400000);
      const month = new Date(Date.now() - 30*86400000);
      const [{ data: all }, { data: users }, { data: topSvc }] = await Promise.all([
        supabase.from("orders").select("total_price, status, created_at, service_name"),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("orders").select("service_name").eq("status","completed"),
      ]);
      const ordersAll = all ?? [];
      const sum = (rows: any[]) => rows.reduce((a, r) => a + Number(r.total_price ?? 0), 0);
      const dayRev = sum(ordersAll.filter((r) => new Date(r.created_at) >= today));
      const weekRev = sum(ordersAll.filter((r) => new Date(r.created_at) >= week));
      const monthRev = sum(ordersAll.filter((r) => new Date(r.created_at) >= month));
      const counts: Record<string, number> = {};
      (topSvc ?? []).forEach((r: any) => { counts[r.service_name] = (counts[r.service_name] ?? 0) + 1; });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      setStats({
        dayRev, weekRev, monthRev,
        users: users?.length ?? 0,
        active: ordersAll.filter((r) => r.status === "in_progress" || r.status === "pending").length,
        top: top ? `${top[0]} (${top[1]})` : "—",
        recent: ordersAll.slice(-6).reverse(),
      });
    })();
  }, []);

  if (!stats) return <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Array.from({length:8}).map((_,i)=><div key={i} className="skeleton h-20"/>)}</div>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Bénéfice jour" value={formatPrice(stats.dayRev)} icon={TrendingUp} accent />
        <StatBox label="Bénéfice semaine" value={formatPrice(stats.weekRev)} icon={TrendingUp} />
        <StatBox label="Bénéfice mois" value={formatPrice(stats.monthRev)} icon={TrendingUp} />
        <StatBox label="Clients" value={String(stats.users)} icon={Users} />
        <StatBox label="Commandes actives" value={String(stats.active)} icon={ShoppingCart} />
        <StatBox label="Top service" value={stats.top} icon={TrendingUp} />
      </div>
      <PricingPanel />
    </div>
  );
}

function StatBox({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <div className={`glass rounded-xl p-3 ${accent ? "border-glow glow-soft" : ""}`}>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase"><Icon className="h-3.5 w-3.5" />{label}</div>
      <div className={`mt-1 font-bold ${accent ? "text-gradient text-lg" : "text-base"}`}>{value}</div>
    </div>
  );
}

function PricingPanel() {
  const [p, setP] = useState<any>(null);
  useEffect(() => { supabase.from("pricing_settings").select("*").eq("id",1).maybeSingle().then(({data}) => setP(data)); }, []);
  async function save(patch: any) {
    const { error } = await supabase.from("pricing_settings").update(patch).eq("id", 1);
    if (error) return toast.error(error.message);
    setP({ ...p, ...patch }); toast.success("Smart pricing mis à jour");
  }
  if (!p) return <div className="skeleton h-24" />;
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-bold mb-3 flex items-center gap-2"><Settings2 className="h-4 w-4 text-accent" />Smart Pricing</h3>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <Label>Mode</Label>
          <Select value={p.mode} onValueChange={(v) => save({ mode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manuel</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="auto_plus_20">Auto +20%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Marge globale (%)</Label>
          <Input type="number" defaultValue={p.global_margin_pct} onBlur={(e) => save({ global_margin_pct: Number(e.target.value) })} />
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1"><Label>Mise à jour auto</Label></div>
          <Switch checked={p.auto_update_enabled} onCheckedChange={(v) => save({ auto_update_enabled: v })} />
        </div>
      </div>
    </div>
  );
}

/* ====== ORDERS ADMIN ====== */
function OrdersAdmin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  async function load() {
    const { data } = await supabase.from("orders").select("*, profiles!orders_user_id_fkey(client_id, full_name)").order("created_at", { ascending: false }).limit(200);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status: status as any, progress: status === "completed" ? 100 : status === "in_progress" ? 50 : 0 }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Statut mis à jour"); load();
  }
  const filtered = (rows ?? []).filter((r) => !q || r.service_name.toLowerCase().includes(q.toLowerCase()) || r.link.includes(q));
  return (
    <div className="space-y-3">
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" /></div>
      <div className="space-y-2">
        {rows === null && Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-20"/>)}
        {filtered.map((r) => (
          <div key={r.id} className="glass rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm">{r.service_name} <span className="text-xs text-muted-foreground">· qté {r.quantity}</span></div>
              <a href={r.link} target="_blank" rel="noreferrer" className="text-[11px] text-accent truncate block">{r.link}</a>
              <div className="text-[11px] text-muted-foreground">{r.profiles?.client_id} — {r.profiles?.full_name ?? "—"}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-bold">{formatPrice(r.total_price)}</div>
              <Select value={r.status} onValueChange={(v) => setStatus(r.id, v)}>
                <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="refunded">Remboursé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ====== RECHARGES ADMIN ====== */
function RechargesAdmin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<"pending" | "history">("pending");

  async function load() {
    const { data } = await supabase
      .from("recharges")
      .select("*, profiles!recharges_user_id_fkey(client_id, full_name, balance, id)")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function approve(r: any) {
    if (busy[r.id] || r.status !== "pending") return;
    setBusy((b) => ({ ...b, [r.id]: true }));
    // Optimistic lock: only update if still pending
    const { data, error } = await supabase.rpc("approve_recharge", { _recharge_id: r.id });
    setBusy((b) => ({ ...b, [r.id]: false }));
    if (error) return toast.error(error.message);
    const res = Array.isArray(data) ? data[0] : data;
    if (!res?.ok) {
      toast.error(res?.message === "forbidden" ? "Action non autorisée"
        : res?.message?.startsWith("already_") ? "Déjà traitée" : "Erreur");
      load();
      return;
    }
    toast.success(`✅ Validée · +${formatPrice(r.amount)}`);
    load();
  }

  async function reject(r: any) {
    if (busy[r.id] || r.status !== "pending") return;
    setBusy((b) => ({ ...b, [r.id]: true }));
    const { data, error } = await supabase.rpc("reject_recharge", { _recharge_id: r.id, _note: null });
    setBusy((b) => ({ ...b, [r.id]: false }));
    if (error) return toast.error(error.message);
    const res = Array.isArray(data) ? data[0] : data;
    if (!res?.ok) { toast.error("Action impossible"); load(); return; }
    toast.success("Rejetée");
    load();
  }

  const pending = (rows ?? []).filter((r) => r.status === "pending");
  const history = (rows ?? []).filter((r) => r.status !== "pending");
  const list = tab === "pending" ? pending : history;

  return (
    <div className="space-y-3">
      <div className="inline-flex glass rounded-xl p-1 border border-white/10">
        <button
          onClick={() => setTab("pending")}
          className={`px-3 h-8 rounded-lg text-xs font-bold ${tab==="pending" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"}`}
        >En attente {pending.length > 0 && <span className="ml-1 px-1.5 rounded bg-white/20">{pending.length}</span>}</button>
        <button
          onClick={() => setTab("history")}
          className={`px-3 h-8 rounded-lg text-xs font-bold ${tab==="history" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"}`}
        >Historique</button>
      </div>

      <div className="space-y-2">
        {rows === null && Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-16"/>)}
        {rows !== null && list.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {tab === "pending" ? "Aucune recharge en attente" : "Historique vide"}
          </p>
        )}
        {list.map((r) => {
          const isPending = r.status === "pending";
          const isApproved = r.status === "approved";
          return (
            <div key={r.id} className="glass rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{formatPrice(r.amount)}</div>
                  {isApproved && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[oklch(0.72_0.18_155_/_0.2)] text-[oklch(0.72_0.18_155)] border border-[oklch(0.72_0.18_155_/_0.4)]">
                      ✓ VALIDÉ
                    </span>
                  )}
                  {r.status === "rejected" && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-destructive/20 text-destructive border border-destructive/40">
                      ✗ REJETÉ
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {r.profiles?.client_id} · {r.profiles?.full_name ?? "—"} · {new Date(r.created_at).toLocaleString("fr-FR")}
                </div>
                {(r.reference || r.sender_number) && (
                  <div className="text-[11px] text-accent mt-0.5">
                    {r.sender_number && <>📱 {r.sender_number}</>}
                    {r.reference && <> · 🔖 {r.reference}</>}
                  </div>
                )}
                {r.processed_at && !isPending && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Traitée le {new Date(r.processed_at).toLocaleString("fr-FR")}
                  </div>
                )}
              </div>
              {isPending ? (
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    disabled={!!busy[r.id]}
                    onClick={() => approve(r)}
                    className="bg-[oklch(0.72_0.18_155)] text-[oklch(0.1_0.02_250)] hover:opacity-90 disabled:opacity-50"
                  >
                    {busy[r.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="destructive" disabled={!!busy[r.id]} onClick={() => reject(r)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ====== SERVICES ADMIN ====== */
function ServicesAdmin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  async function load() { const { data } = await supabase.from("services").select("*").order("platform").order("sort_order"); setRows(data ?? []); }
  useEffect(() => { load(); }, []);

  async function save(s: any) {
    const payload = {
      platform: s.platform, name: s.name, description: s.description,
      price_per_1k: Number(s.price_per_1k), supplier_price_per_1k: Number(s.supplier_price_per_1k ?? 0),
      margin_pct: Number(s.margin_pct ?? 20), min_quantity: Number(s.min_quantity ?? 100),
      max_quantity: Number(s.max_quantity ?? 100000), estimated_time: s.estimated_time,
      badge: s.badge, is_active: s.is_active, sort_order: Number(s.sort_order ?? 0),
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
    <div className="space-y-3">
      <Button onClick={() => setEditing({ platform: "facebook", name: "", price_per_1k: 1000, supplier_price_per_1k: 800, badge: "none", is_active: true })} className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" />Nouveau service</Button>
      <div className="grid sm:grid-cols-2 gap-2">
        {rows === null && Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-20"/>)}
        {rows?.map((s) => (
          <div key={s.id} className="glass rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] uppercase text-accent font-semibold">{s.platform}</div>
                <div className="font-semibold text-sm">{s.name}</div>
                <div className="text-[11px] text-muted-foreground">Vente {formatPrice(s.price_per_1k)} · Coût {formatPrice(s.supplier_price_per_1k)}</div>
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Modifier" : "Nouveau"} service</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Nom</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="col-span-2"><Label>Description</Label><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><Label>Plateforme</Label>
                <Select value={editing.platform} onValueChange={(v) => setEditing({ ...editing, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="facebook">Facebook</SelectItem><SelectItem value="tiktok">TikTok</SelectItem><SelectItem value="instagram">Instagram</SelectItem></SelectContent>
                </Select></div>
              <div><Label>Badge</Label>
                <Select value={editing.badge} onValueChange={(v) => setEditing({ ...editing, badge: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem><SelectItem value="top">🔥 Top</SelectItem><SelectItem value="new">⭐ Nouveau</SelectItem><SelectItem value="fast">⚡ Rapide</SelectItem>
                  </SelectContent>
                </Select></div>
              <div><Label>Prix vente /1k</Label><Input type="number" value={editing.price_per_1k} onChange={(e) => setEditing({ ...editing, price_per_1k: e.target.value })} /></div>
              <div><Label>Coût fournisseur /1k</Label><Input type="number" value={editing.supplier_price_per_1k} onChange={(e) => setEditing({ ...editing, supplier_price_per_1k: e.target.value })} /></div>
              <div><Label>Quantité min</Label><Input type="number" value={editing.min_quantity ?? 100} onChange={(e) => setEditing({ ...editing, min_quantity: e.target.value })} /></div>
              <div><Label>Quantité max</Label><Input type="number" value={editing.max_quantity ?? 100000} onChange={(e) => setEditing({ ...editing, max_quantity: e.target.value })} /></div>
              <div><Label>Délai estimé</Label><Input value={editing.estimated_time ?? "0-1h"} onChange={(e) => setEditing({ ...editing, estimated_time: e.target.value })} /></div>
              <div><Label>Ordre</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} /></div>
              <div className="col-span-2 flex items-center justify-between glass rounded-lg p-2">
                <Label>Actif</Label><Switch checked={!!editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => save(editing)} className="gradient-primary text-primary-foreground">Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ====== CLIENTS ADMIN ====== */
function ClientsAdmin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  async function load() {
    const { data } = await supabase.from("profiles").select("id, client_id, full_name, email, balance, created_at").order("created_at",{ascending:false}).limit(200);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);
  async function adjust(id: string, delta: number) {
    const r = rows?.find((x) => x.id === id); if (!r) return;
    const newBal = Math.max(0, Number(r.balance) + delta);
    const { error } = await supabase.from("profiles").update({ balance: newBal }).eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({ user_id: id, title: delta > 0 ? "Solde crédité" : "Solde débité", body: `${delta > 0 ? "+" : ""}${formatPrice(delta)}`, type: "balance" });
    toast.success("OK"); load();
  }
  const filtered = (rows ?? []).filter((r) => !q || (r.client_id?.toLowerCase().includes(q.toLowerCase()) || r.email?.toLowerCase().includes(q.toLowerCase()) || r.full_name?.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-3">
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher client…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" /></div>
      <div className="space-y-2">
        {rows === null && Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-16"/>)}
        {filtered.map((r) => <ClientRow key={r.id} r={r} onAdjust={adjust} />)}
      </div>
    </div>
  );
}

function ClientRow({ r, onAdjust }: { r: any; onAdjust: (id: string, delta: number) => void }) {
  const [amt, setAmt] = useState(5000);
  return (
    <div className="glass rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
      <div>
        <div className="font-semibold text-sm">{r.full_name ?? r.email}</div>
        <div className="text-[11px] text-muted-foreground font-mono">{r.client_id} · {r.email}</div>
        <div className="text-[11px]">Solde: <span className="font-bold text-accent">{formatPrice(r.balance)}</span></div>
      </div>
      <div className="flex items-center gap-1.5">
        <Input type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} className="w-24 h-8" />
        <Button size="sm" onClick={() => onAdjust(r.id, amt)} className="bg-[oklch(0.72_0.18_155)] text-[oklch(0.1_0.02_250)] h-8">Créditer</Button>
        <Button size="sm" variant="destructive" onClick={() => onAdjust(r.id, -amt)} className="h-8">Débiter</Button>
      </div>
    </div>
  );
}

/* ====== CONTENT (ANNONCES) ====== */
function ContentAdmin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  async function load() { const { data } = await supabase.from("announcements").select("*").order("sort_order"); setRows(data ?? []); }
  useEffect(() => { load(); }, []);
  async function save(a: any) {
    const payload = { title: a.title, content: a.content, type: a.type, is_active: !!a.is_active, sort_order: Number(a.sort_order ?? 0) };
    const { error } = a.id ? await supabase.from("announcements").update(payload).eq("id", a.id) : await supabase.from("announcements").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Sauvegardé"); setEditing(null); load();
  }
  async function del(id: string) {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    toast.success("Supprimé"); load();
  }
  return (
    <div className="space-y-3">
      <Button onClick={() => setEditing({ title: "", content: "", type: "banner", is_active: true, sort_order: 99 })} className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1.5" />Nouvelle annonce</Button>
      <div className="space-y-2">
        {rows === null && Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-16"/>)}
        {rows?.map((a) => (
          <div key={a.id} className="glass rounded-xl p-3 flex justify-between items-start gap-2">
            <div className="min-w-0">
              <div className="font-semibold text-sm">{a.title} <span className="text-[10px] uppercase text-muted-foreground">· {a.type}</span> {!a.is_active && <span className="text-[10px] text-destructive">· inactif</span>}</div>
              <div className="text-xs text-muted-foreground truncate">{a.content}</div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => setEditing(a)}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => del(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Modifier" : "Nouvelle"} annonce</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Titre</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Contenu</Label><Textarea rows={3} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Type</Label>
                  <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="banner">Bannière</SelectItem><SelectItem value="slider">Slider</SelectItem><SelectItem value="popup">Popup</SelectItem></SelectContent>
                  </Select></div>
                <div><Label>Ordre</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} /></div>
              </div>
              <div className="flex justify-between items-center glass rounded-lg p-2"><Label>Actif</Label><Switch checked={!!editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={() => save(editing)} className="gradient-primary text-primary-foreground">Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
