import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageCircle, Wallet, Loader2 } from "lucide-react";
import { formatPrice, waLink, WHATSAPP_NUMBER } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/recharge")({
  component: RechargePage,
});

type Recharge = { id: string; amount: number; status: string; created_at: string };

const QUICK = [5000, 10000, 25000, 50000, 100000];

function RechargePage() {
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState<number>(10000);
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState<Recharge[] | null>(null);

  async function load() {
    if (!user) return;
    const { data } = await supabase.from("recharges").select("id, amount, status, created_at").eq("user_id", user.id).order("created_at",{ascending:false}).limit(20);
    setList((data as Recharge[]) ?? []);
  }
  useEffect(() => { load(); }, [user]);

  async function request() {
    if (!user || amount < 1000) return toast.error("Montant minimum 1000 Ar");
    setBusy(true);
    const { data, error } = await supabase.from("recharges").insert({ user_id: user.id, amount, method: "whatsapp" }).select("id").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Demande créée — envoyez la preuve sur WhatsApp");
    const msg = `Bonjour, je souhaite recharger mon compte ẞoost-by Ecr_aaM.\n\nID client: ${profile?.client_id}\nMontant: ${formatPrice(amount)}\nRef demande: ${data.id}\n\nJe joins ma preuve de paiement.`;
    window.open(waLink(msg), "_blank");
    load();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 fade-in space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Recharger mon solde</h1>
        <p className="text-xs text-muted-foreground">Paiement manuel via WhatsApp · validation admin sous 24h</p>
      </div>

      <div className="glass-strong rounded-2xl p-5">
        <div className="text-[11px] uppercase text-muted-foreground">Solde actuel</div>
        <div className="text-3xl font-bold text-gradient">{formatPrice(profile?.balance ?? 0)}</div>
      </div>

      <div className="glass rounded-2xl p-5 space-y-4">
        <div>
          <Label htmlFor="amt">Montant à recharger (Ar)</Label>
          <Input id="amt" type="number" min={1000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1 text-lg font-bold" />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => setAmount(q)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${amount===q ? "border-glow bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
                {formatPrice(q)}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-secondary/40 border border-border/60 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">📲 Procédure</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Cliquez sur "Demander la recharge"</li>
            <li>Vous serez redirigé vers WhatsApp ({WHATSAPP_NUMBER})</li>
            <li>Envoyez votre preuve de paiement</li>
            <li>L'admin créditera votre solde manuellement</li>
          </ol>
        </div>

        <Button onClick={request} disabled={busy} className="w-full gradient-primary text-primary-foreground glow-soft h-11">
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageCircle className="h-4 w-4 mr-2" />}
          Demander la recharge
        </Button>
      </div>

      <div className="glass rounded-2xl p-4">
        <h2 className="font-bold mb-2 flex items-center gap-2"><Wallet className="h-4 w-4 text-accent" />Historique</h2>
        {list === null && <div className="space-y-2">{Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-12" />)}</div>}
        {list && list.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucune recharge</p>}
        <ul className="divide-y divide-border/50">
          {list?.map((r) => (
            <li key={r.id} className="py-2.5 flex justify-between items-center">
              <div>
                <div className="text-sm font-semibold">{formatPrice(r.amount)}</div>
                <div className="text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleString("fr-FR")}</div>
              </div>
              <RechargeStatus s={r.status} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RechargeStatus({ s }: { s: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending: { cls: "bg-[oklch(0.82_0.17_85)]/15 text-[oklch(0.82_0.17_85)] border-[oklch(0.82_0.17_85)]/30", label: "🟡 En attente" },
    approved: { cls: "bg-[oklch(0.72_0.18_155)]/15 text-[oklch(0.72_0.18_155)] border-[oklch(0.72_0.18_155)]/30", label: "🟢 Approuvée" },
    rejected: { cls: "bg-destructive/15 text-destructive border-destructive/30", label: "🔴 Rejetée" },
  };
  const m = map[s];
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m?.cls}`}>{m?.label}</span>;
}
