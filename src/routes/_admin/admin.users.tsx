import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export const Route = createFileRoute("/_admin/admin/users")({
  component: UsersAdmin,
});

function UsersAdmin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("id, client_id, full_name, email, balance, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function adjust(id: string, delta: number) {
    const r = rows?.find((x) => x.id === id); if (!r) return;
    const newBal = Math.max(0, Number(r.balance) + delta);
    const { error } = await supabase.from("profiles").update({ balance: newBal }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Solde mis à jour"); load();
  }

  const filtered = (rows ?? []).filter((r) =>
    !q ||
    r.client_id?.toLowerCase().includes(q.toLowerCase()) ||
    r.email?.toLowerCase().includes(q.toLowerCase()) ||
    r.full_name?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-3 fade-in">
      <div>
        <h1 className="text-xl font-black">Utilisateurs</h1>
        <p className="text-xs text-muted-foreground">Liste des clients et ajustement de solde</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher (ID, email, nom)…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {rows === null && Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16" />)}
        {rows !== null && filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun utilisateur</p>}
        {filtered.map((r) => <UserRow key={r.id} r={r} onAdjust={adjust} />)}
      </div>
    </div>
  );
}

function UserRow({ r, onAdjust }: { r: any; onAdjust: (id: string, delta: number) => void }) {
  const [amt, setAmt] = useState(5000);
  return (
    <div className="glass rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
      <div className="min-w-0">
        <div className="font-semibold text-sm truncate">{r.full_name ?? r.email}</div>
        <div className="text-[11px] text-muted-foreground font-mono truncate">{r.client_id} · {r.email}</div>
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
