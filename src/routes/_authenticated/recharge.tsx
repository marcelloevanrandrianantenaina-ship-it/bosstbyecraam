import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Wallet, Copy, Check, Phone, User2, Rocket, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/_authenticated/recharge")({
  component: RechargePage,
});

type Recharge = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  reference: string | null;
  sender_number: string | null;
};

const QUICK = [2000, 5000, 10000, 25000, 50000];

function RechargePage() {
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState<string>("");
  const [sender, setSender] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [list, setList] = useState<Recharge[] | null>(null);

  async function load() {
    if (!user) return;
    const { data } = await supabase
      .from("recharges")
      .select("id, amount, status, created_at, reference, sender_number")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setList((data as Recharge[]) ?? []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(MVOLA_NUMBER);
      setCopied(true);
      toast.success("Numéro copié");
      setTimeout(() => setCopied(false), 1500);
    } catch { toast.error("Impossible de copier"); }
  }

  function validate(): string | null {
    const amt = Number(amount);
    if (!amt || isNaN(amt)) return "Montant invalide";
    if (amt < MIN_RECHARGE) return `Montant minimum ${formatPrice(MIN_RECHARGE)}`;
    if (!/^0\d{9}$/.test(sender.replace(/\s/g, ""))) return "Numéro invalide (ex: 0347856539)";
    if (!reference.trim() || reference.trim().length < 4) return "Référence/Transaction ID requis";
    return null;
  }

  async function submit() {
    if (!user) return;
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setBusy(true);
    const refClean = reference.trim();
    // duplicate check
    const { data: dup } = await supabase
      .from("recharges")
      .select("id")
      .ilike("reference", refClean)
      .maybeSingle();
    if (dup) {
      setBusy(false);
      setError("Cette référence a déjà été utilisée");
      return;
    }
    const { error: insErr } = await supabase.from("recharges").insert({
      user_id: user.id,
      amount: Number(amount),
      method: "mvola",
      reference: refClean,
      sender_number: sender.replace(/\s/g, ""),
    });
    setBusy(false);
    if (insErr) { setError(insErr.message); return; }
    toast.success("Demande envoyée — validation sous 24h");
    setAmount(""); setSender(""); setReference("");
    load();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-5 fade-in space-y-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Recharger mon solde</h1>
        <p className="text-xs text-muted-foreground">Paiement MVola / Yas · validation sous 24h</p>
      </div>

      {/* Balance */}
      <div className="relative glass-strong rounded-2xl p-5 border-glow overflow-hidden">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Solde actuel</div>
        <div className="text-3xl font-bold text-gradient mt-1">{formatPrice(profile?.balance ?? 0)}</div>
        <div className="text-[11px] text-muted-foreground mt-1">Client #{profile?.client_id}</div>
      </div>

      {/* MVola number card */}
      <div className="glass rounded-2xl p-5 border border-accent/30 glow-soft space-y-3">
        <div className="text-sm font-bold flex items-center gap-2">
          <Phone className="h-4 w-4 text-accent" />
          📞 Envoyez à ce numéro MVola
        </div>
        <button
          type="button"
          onClick={copyNumber}
          className="w-full flex items-center justify-between gap-3 rounded-xl bg-secondary/60 border border-accent/40 px-4 py-4 active:scale-[0.98] transition"
        >
          <span className="text-2xl sm:text-3xl font-bold tracking-wider text-gradient">{MVOLA_NUMBER}</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent border border-accent/40 px-2.5 py-1.5 rounded-lg">
            {copied ? <><Check className="h-3.5 w-3.5" />Copié</> : <><Copy className="h-3.5 w-3.5" />Copier</>}
          </span>
        </button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User2 className="h-3.5 w-3.5 text-accent" />
          Titulaire : <span className="font-semibold text-foreground">{MVOLA_ACCOUNT_NAME}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="glass rounded-2xl p-5 space-y-3 leading-relaxed">
        <div className="text-sm font-bold">Fomba famenoana azy 👇</div>
        <p className="text-xs text-muted-foreground">
          Mba hampidirana ny volanao ao anatin'ny site ato dia transfereo @<span className="text-accent font-semibold">{MVOLA_NUMBER}</span> ilay vola.
        </p>

        <div className="text-sm font-bold pt-1">💥 Fomba famenoana ilay cage 👇</div>

        <div className="space-y-2 text-xs">
          <div className="rounded-xl bg-secondary/50 border border-border/60 p-3">
            <div className="font-semibold text-foreground mb-1">💥 Montant (Vola nalefanao tany @{MVOLA_NUMBER}) ✅</div>
            <p className="text-muted-foreground">Soraty ny vola nalefanao tamin'ny findainao.</p>
            <p className="text-muted-foreground mt-1">
              Ohatra : Raha <span className="text-accent font-semibold">5000</span> no nalefanao dia <span className="text-accent font-semibold">5000</span> fotsiny soratana.
              <br />(Aza asiana "Ar")
            </p>
          </div>

          <div className="rounded-xl bg-secondary/50 border border-border/60 p-3">
            <div className="font-semibold text-foreground mb-1">💥 Votre numéro (Laharana nandefasana ilay vola) ✅</div>
            <p className="text-muted-foreground">Soraty ny numéro nampiasainao nandefasana ilay vola.</p>
            <p className="text-muted-foreground mt-1">(Yas na MVola ihany)</p>
          </div>

          <div className="rounded-xl bg-secondary/50 border border-border/60 p-3">
            <div className="font-semibold text-foreground mb-1">💥 Référence (ID transaction tao amin'ny SMS) ✅</div>
            <p className="text-muted-foreground">Ity no tena zava-dehibe indrindra.</p>
            <p className="text-muted-foreground mt-1">
              Kopiavo tsara ilay <span className="text-accent font-semibold">Reference</span> na <span className="text-accent font-semibold">Transaction ID</span> izay azonao tamin'ny SMS.
            </p>
            <p className="text-muted-foreground mt-1">
              Ohatra : <span className="text-accent font-semibold">1416328828</span> na <span className="text-accent font-semibold">3c7ee2f5</span>
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="glass-strong rounded-2xl p-5 border border-accent/30 space-y-4">
        <div className="text-sm font-bold flex items-center gap-2"><Rocket className="h-4 w-4 text-accent" />Envoyer ma preuve</div>

        <div className="space-y-1.5">
          <Label htmlFor="amt" className="text-xs">Montant (Ar)</Label>
          <Input
            id="amt" type="number" inputMode="numeric" pattern="[0-9]*"
            placeholder="Ex: 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 text-lg font-bold bg-secondary/40"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => setAmount(String(q))}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition ${Number(amount)===q ? "border-accent bg-accent/10 text-accent" : "border-border bg-secondary/40 text-muted-foreground"}`}>
                {formatPrice(q)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sender" className="text-xs">Votre numéro (Yas / MVola)</Label>
          <Input
            id="sender" type="tel" inputMode="numeric" pattern="[0-9]*"
            placeholder="Ex: 0347856539"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            maxLength={13}
            className="h-12 bg-secondary/40 tracking-wider"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ref" className="text-xs">Référence / Transaction ID (SMS)</Label>
          <Input
            id="ref" type="text"
            placeholder="Ex: 1416328828 ou 3c7ee2f5"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            maxLength={64}
            className="h-12 bg-secondary/40 font-mono"
          />
        </div>

        {error && (
          <div className="fade-in flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={submit} disabled={busy}
          className="w-full h-12 text-base font-bold gradient-primary text-primary-foreground glow hover:opacity-95"
        >
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          🚀 Envoyer la demande
        </Button>
      </div>

      {/* History */}
      <div className="glass rounded-2xl p-4">
        <h2 className="font-bold mb-2 flex items-center gap-2 text-sm"><Wallet className="h-4 w-4 text-accent" />Historique des recharges</h2>
        {list === null && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>}
        {list && list.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">Aucune recharge</p>}
        <ul className="divide-y divide-border/50">
          {list?.map((r) => (
            <li key={r.id} className="py-2.5 flex justify-between items-center gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{formatPrice(r.amount)}</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {new Date(r.created_at).toLocaleString("fr-FR")}
                  {r.reference ? ` · Ref ${r.reference}` : ""}
                </div>
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
  const m = map[s] ?? { cls: "border-border", label: s };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${m.cls}`}>{m.label}</span>;
}
