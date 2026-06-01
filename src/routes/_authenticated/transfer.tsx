import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Loader2, ArrowRight, History } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/transfer")({
  component: TransferPage,
});

type TransferRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  recipient_client_id: string;
  amount: number;
  note: string | null;
  created_at: string;
};

function TransferPage() {
  const { user, profile, refresh } = useAuth();
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<TransferRow[] | null>(null);

  async function loadHistory() {
    if (!user) return;
    const { data } = await supabase
      .from("balance_transfers")
      .select("id, sender_id, recipient_id, recipient_client_id, amount, note, created_at")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(20);
    setHistory((data as TransferRow[]) ?? []);
  }

  useEffect(() => { loadHistory(); }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!clientId.trim()) return toast.error("ID destinataire requis");
    if (!Number.isFinite(amt) || amt <= 0) return toast.error("Montant invalide");
    if ((profile?.balance ?? 0) < amt) return toast.error("Solde insuffisant");

    setBusy(true);
    const { data, error } = await supabase.rpc("transfer_balance", {
      _recipient_client_id: clientId.trim().toUpperCase(),
      _amount: amt,
      _note: note.trim() || undefined,
    });
    setBusy(false);

    if (error) return toast.error(error.message);
    const res = (data as any)?.[0];
    if (!res?.ok) {
      const msg: Record<string, string> = {
        recipient_not_found: "Destinataire introuvable",
        insufficient_balance: "Solde insuffisant",
        cannot_transfer_to_self: "Vous ne pouvez pas vous transférer à vous-même",
        invalid_amount: "Montant invalide",
        unauthenticated: "Non authentifié",
      };
      return toast.error(msg[res?.message] ?? "Échec du transfert");
    }
    toast.success(`Transfert de ${formatPrice(amt)} envoyé !`);
    setClientId(""); setAmount(""); setNote("");
    refresh();
    loadHistory();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-black">Transfert de solde</h1>
        <p className="text-xs text-muted-foreground">Envoyez du crédit à un autre utilisateur</p>
      </div>

      <div className="glass-strong rounded-2xl p-4 border border-primary/20 glow-soft text-center">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Solde disponible</div>
        <div className="text-2xl font-black text-gradient mt-0.5">{formatPrice(profile?.balance ?? 0)}</div>
      </div>

      <form onSubmit={submit} className="glass rounded-2xl p-5 space-y-4">
        <div>
          <Label htmlFor="cid">ID destinataire</Label>
          <Input
            id="cid"
            value={clientId}
            onChange={(e) => setClientId(e.target.value.toUpperCase())}
            placeholder="CL-XXXXXXXX"
            className="mt-1 font-mono"
            required
          />
        </div>
        <div>
          <Label htmlFor="amt">Montant (Ar)</Label>
          <Input id="amt" type="number" min={1} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" className="mt-1" required />
        </div>
        <div>
          <Label htmlFor="note">Note (optionnel)</Label>
          <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} placeholder="Merci !" className="mt-1" />
        </div>
        <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground glow-soft">
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Envoyer
        </Button>
      </form>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <History className="h-4 w-4 text-accent" />
          <h2 className="font-bold">Historique</h2>
        </div>
        {history === null ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : history.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">Aucun transfert pour le moment</div>
        ) : (
          <ul className="divide-y divide-border/50">
            {history.map((t) => {
              const out = t.sender_id === user?.id;
              return (
                <li key={t.id} className="py-3 flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg grid place-items-center ${out ? "bg-destructive/15 text-destructive" : "bg-[oklch(0.72_0.18_155)]/15 text-[oklch(0.72_0.18_155)]"}`}>
                    <ArrowRight className={`h-4 w-4 ${out ? "" : "rotate-180"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">
                      {out ? "Envoyé à " : "Reçu de "}<span className="font-mono">{t.recipient_client_id}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleString("fr-FR")}</div>
                  </div>
                  <div className={`text-sm font-black ${out ? "text-destructive" : "text-[oklch(0.72_0.18_155)]"}`}>
                    {out ? "-" : "+"}{formatPrice(t.amount)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
