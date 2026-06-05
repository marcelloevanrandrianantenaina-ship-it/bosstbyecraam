import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2, Check, X, Wallet, UserCircle2, Smartphone, Hash, Clock,
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_admin/admin/recharges")({
  component: RechargesAdmin,
});

function RechargesAdmin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<"pending" | "history">("pending");

  async function load() {
    const { data: recs } = await supabase
      .from("recharges")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    const ids = Array.from(new Set((recs ?? []).map((r: any) => r.user_id)));
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("id, client_id, full_name, avatar_url").in("id", ids)
      : { data: [] as any[] };
    const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
    setRows((recs ?? []).map((r: any) => ({ ...r, profile: map.get(r.user_id) ?? null })));
  }
  useEffect(() => { load(); }, []);

  async function approve(r: any) {
    if (busy[r.id]) return;
    setBusy((b) => ({ ...b, [r.id]: true }));
    const { data, error } = await supabase.rpc("approve_recharge", { _recharge_id: r.id });
    setBusy((b) => ({ ...b, [r.id]: false }));
    if (error) return toast.error(error.message);
    const res = Array.isArray(data) ? data[0] : data;
    if (!res?.ok) { toast.error(res?.message ?? "Erreur"); load(); return; }
    toast.success(`✅ Validée · +${formatPrice(r.amount)}`);
    load();
  }

  async function reject(r: any) {
    if (busy[r.id]) return;
    if (!confirm(`Refuser le dépôt de ${formatPrice(r.amount)} ?`)) return;
    setBusy((b) => ({ ...b, [r.id]: true }));
    const { data, error } = await supabase.rpc("reject_recharge", { _recharge_id: r.id });
    setBusy((b) => ({ ...b, [r.id]: false }));
    if (error) return toast.error(error.message);
    const res = Array.isArray(data) ? data[0] : data;
    if (!res?.ok) { toast.error("Action impossible"); load(); return; }
    toast.success("Rejetée"); load();
  }

  const pending = (rows ?? []).filter((r) => r.status === "pending");
  const history = (rows ?? []).filter((r) => r.status !== "pending");
  const list = tab === "pending" ? pending : history;

  const pendingSum = pending.reduce((a, r) => a + Number(r.amount || 0), 0);

  return (
    <div className="space-y-4 fade-in">
      <PageHeader
        eyebrow="Validation"
        title="Dépôts MVola"
        subtitle="Approuvez ou refusez les recharges des clients"
        icon={Wallet}
      />

      <section className="rounded-2xl glass-strong border border-primary/20 px-4 py-3 glow-soft text-center">
        <div className="text-[10px] uppercase tracking-wider text-accent font-bold">À valider</div>
        <div className="text-2xl font-black mt-0.5 text-gradient">{formatPrice(pendingSum)}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {pending.length} dépôt(s) en attente
        </div>
      </section>

      <div className="inline-flex glass rounded-xl p-1 border border-white/10">
        <TabBtn active={tab === "pending"} onClick={() => setTab("pending")} count={pending.length}>
          En attente
        </TabBtn>
        <TabBtn active={tab === "history"} onClick={() => setTab("history")}>
          Historique
        </TabBtn>
      </div>

      <div className="space-y-2.5">
        {rows === null && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
        {rows !== null && list.length === 0 && (
          <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">
            {tab === "pending" ? "Aucune recharge en attente 🎉" : "Aucun historique"}
          </div>
        )}
        {list.map((r) => {
          const isPending = r.status === "pending";
          return (
            <div key={r.id} className="glass rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center overflow-hidden shrink-0">
                  {r.profile?.avatar_url
                    ? <img src={r.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    : <UserCircle2 className="h-5 w-5 text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-base font-black text-gradient">{formatPrice(r.amount)}</div>
                    {r.status === "approved" && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[oklch(0.72_0.18_155_/_0.2)] text-[oklch(0.72_0.18_155)] border border-[oklch(0.72_0.18_155_/_0.4)]">✓ VALIDÉ</span>
                    )}
                    {r.status === "rejected" && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-destructive/20 text-destructive border border-destructive/40">✗ REJETÉ</span>
                    )}
                    {isPending && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 inline-flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />EN ATTENTE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    <span className="font-mono">{r.profile?.client_id ?? "—"}</span>
                    {r.profile?.full_name && <> · {r.profile.full_name}</>}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(r.created_at).toLocaleString("fr-FR")}
                  </div>
                  {(r.reference || r.sender_number) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.sender_number && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold">
                          <Smartphone className="h-2.5 w-2.5" />{r.sender_number}
                        </span>
                      )}
                      {r.reference && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
                          <Hash className="h-2.5 w-2.5" />{r.reference}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {isPending && (
                <div className="mt-3 flex gap-2">
                  <Button
                    disabled={!!busy[r.id]} onClick={() => approve(r)}
                    className="flex-1 bg-[oklch(0.72_0.18_155)] text-[oklch(0.1_0.02_250)] hover:opacity-90 disabled:opacity-50 font-black"
                  >
                    {busy[r.id] ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
                    Approuver
                  </Button>
                  <Button
                    variant="destructive" disabled={!!busy[r.id]} onClick={() => reject(r)}
                    className="flex-1 font-black"
                  >
                    <X className="h-4 w-4 mr-1.5" />Refuser
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, count, children }: { active: boolean; onClick: () => void; count?: number; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 h-8 rounded-lg text-xs font-bold transition-all ${
        active ? "gradient-primary text-primary-foreground glow-soft" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className="ml-1 px-1.5 rounded bg-white/20">{count}</span>
      )}
    </button>
  );
}
