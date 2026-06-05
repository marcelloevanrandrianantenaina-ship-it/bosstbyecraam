import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search, UserCircle2, Users as UsersIcon, Copy, Wallet, Plus, Minus, Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_admin/admin/users")({
  component: UsersAdmin,
});

function UsersAdmin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("id, client_id, full_name, email, balance, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  const filtered = (rows ?? []).filter((r) =>
    !q ||
    r.client_id?.toLowerCase().includes(q.toLowerCase()) ||
    r.email?.toLowerCase().includes(q.toLowerCase()) ||
    (r.full_name ?? "").toLowerCase().includes(q.toLowerCase())
  );

  const totalBalance = (rows ?? []).reduce((a, r) => a + Number(r.balance || 0), 0);

  return (
    <div className="space-y-4 fade-in">
      <PageHeader
        eyebrow="Comptes"
        title="Utilisateurs"
        subtitle="Liste des clients et ajustement de solde"
        icon={UsersIcon}
      />

      <section className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-3 flex items-center gap-3 border-glow glow-soft">
          <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center text-primary-foreground">
            <UsersIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total clients</div>
            <div className="text-lg font-black text-gradient leading-none mt-0.5">
              {(rows?.length ?? 0).toLocaleString("fr-FR")}
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-3 flex items-center gap-3 border border-white/10">
          <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center text-primary-foreground">
            <Wallet className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Solde cumulé</div>
            <div className="text-base font-black leading-none mt-0.5">{formatPrice(totalBalance)}</div>
          </div>
        </div>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher (ID, email, nom)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 h-10 rounded-2xl glass border-white/10"
        />
      </div>

      <div className="space-y-2.5">
        {rows === null && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
        {rows !== null && filtered.length === 0 && (
          <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">
            Aucun utilisateur
          </div>
        )}
        {filtered.map((r) => (
          <UserRow key={r.id} r={r} onAdjust={() => setEditing(r)} />
        ))}
      </div>

      <AdjustDialog
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />
    </div>
  );
}

function UserRow({ r, onAdjust }: { r: any; onAdjust: () => void }) {
  function copyId() {
    navigator.clipboard.writeText(r.client_id ?? "");
    toast.success("ID copié");
  }
  return (
    <div className="glass rounded-2xl p-3 border border-white/10 flex items-center gap-3">
      <div className="h-11 w-11 rounded-xl bg-primary/15 grid place-items-center overflow-hidden shrink-0">
        {r.avatar_url
          ? <img src={r.avatar_url} alt="" className="h-full w-full object-cover" />
          : <UserCircle2 className="h-6 w-6 text-primary" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold truncate">{r.full_name ?? r.email}</div>
        <button onClick={copyId} className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline font-mono truncate">
          {r.client_id} <Copy className="h-2.5 w-2.5" />
        </button>
        <div className="text-[11px] mt-0.5">
          <span className="text-muted-foreground">Solde: </span>
          <span className="font-black text-gradient">{formatPrice(r.balance)}</span>
        </div>
      </div>
      <Button size="sm" onClick={onAdjust} className="gradient-primary text-primary-foreground h-9 px-3 font-bold">
        <Wallet className="h-3.5 w-3.5 mr-1" />Ajuster
      </Button>
    </div>
  );
}

function AdjustDialog({
  user, onClose, onSaved,
}: { user: any | null; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState(5000);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) setAmount(5000); }, [user?.id]);

  async function apply(delta: number) {
    if (!user) return;
    setBusy(true);
    const newBal = Math.max(0, Number(user.balance) + delta);
    const { error } = await supabase.from("profiles").update({ balance: newBal }).eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(delta > 0 ? `+${formatPrice(delta)} crédité` : `${formatPrice(delta)} débité`);
    onSaved();
  }

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ajuster le solde</DialogTitle>
        </DialogHeader>
        {user && (
          <div className="space-y-3">
            <div className="glass rounded-xl p-3 flex items-center gap-3 border border-primary/20">
              <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center overflow-hidden">
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                  : <UserCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">{user.full_name ?? user.email}</div>
                <div className="text-[11px] text-muted-foreground font-mono truncate">{user.client_id}</div>
                <div className="text-xs font-black text-gradient">Solde: {formatPrice(user.balance)}</div>
              </div>
            </div>
            <div>
              <Label>Montant (Ar)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
        )}
        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => apply(-Math.abs(amount))}
            variant="destructive"
            disabled={busy || !amount}
            className="font-black"
          >
            {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Minus className="h-4 w-4 mr-1.5" />}
            Débiter
          </Button>
          <Button
            onClick={() => apply(Math.abs(amount))}
            disabled={busy || !amount}
            className="bg-[oklch(0.72_0.18_155)] text-[oklch(0.1_0.02_250)] hover:opacity-90 font-black"
          >
            {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
            Créditer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
