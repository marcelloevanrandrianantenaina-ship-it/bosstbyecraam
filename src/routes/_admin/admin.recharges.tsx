import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { formatPrice } from "@/lib/constants";

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
      ? await supabase.from("profiles").select("id, client_id, full_name").in("id", ids)
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

  return (
    <div className="space-y-3 fade-in">
      <div>
        <h1 className="text-xl font-black">Validation des dépôts</h1>
        <p className="text-xs text-muted-foreground">Approuvez ou refusez les recharges MVola</p>
      </div>

      <div className="inline-flex glass rounded-xl p-1 border border-white/10">
        <button onClick={() => setTab("pending")}
          className={`px-3 h-8 rounded-lg text-xs font-bold ${tab === "pending" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>
          En attente {pending.length > 0 && <span className="ml-1 px-1.5 rounded bg-white/20">{pending.length}</span>}
        </button>
        <button onClick={() => setTab("history")}
          className={`px-3 h-8 rounded-lg text-xs font-bold ${tab === "history" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>
          Historique
        </button>
      </div>

      <div className="space-y-2">
        {rows === null && Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16" />)}
        {rows !== null && list.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {tab === "pending" ? "Aucune recharge en attente" : "Historique vide"}
          </p>
        )}
        {list.map((r) => {
          const isPending = r.status === "pending";
          return (
            <div key={r.id} className="glass rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{formatPrice(r.amount)}</div>
                  {r.status === "approved" && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[oklch(0.72_0.18_155_/_0.2)] text-[oklch(0.72_0.18_155)] border border-[oklch(0.72_0.18_155_/_0.4)]">✓ VALIDÉ</span>
                  )}
                  {r.status === "rejected" && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-destructive/20 text-destructive border border-destructive/40">✗ REJETÉ</span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {r.profile?.client_id} · {r.profile?.full_name ?? "—"} · {new Date(r.created_at).toLocaleString("fr-FR")}
                </div>
                {(r.reference || r.sender_number) && (
                  <div className="text-[11px] text-accent mt-0.5">
                    {r.sender_number && <>📱 {r.sender_number}</>}
                    {r.reference && <> · 🔖 {r.reference}</>}
                  </div>
                )}
              </div>
              {isPending && (
                <div className="flex gap-1.5">
                  <Button size="sm" disabled={!!busy[r.id]} onClick={() => approve(r)}
                    className="bg-[oklch(0.72_0.18_155)] text-[oklch(0.1_0.02_250)] hover:opacity-90 disabled:opacity-50">
                    {busy[r.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="destructive" disabled={!!busy[r.id]} onClick={() => reject(r)}>
                    <X className="h-4 w-4" />
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
