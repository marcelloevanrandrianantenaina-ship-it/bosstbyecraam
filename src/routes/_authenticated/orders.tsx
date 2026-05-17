import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersPage,
});

type Order = {
  id: string; service_name: string; link: string; quantity: number;
  total_price: number; status: string; progress: number; created_at: string;
};

const STATUS = ["all","pending","in_progress","completed","cancelled","refunded"] as const;
const LABELS: Record<string,string> = {
  all: "Tous", pending: "🟡 En attente", in_progress: "🔵 En cours",
  completed: "🟢 Terminé", cancelled: "🔴 Annulé", refunded: "💸 Remboursé",
};

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<typeof STATUS[number]>("all");

  async function load() {
    if (!user) return;
    const { data } = await supabase.from("orders")
      .select("id, service_name, link, quantity, total_price, status, progress, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, [user]);

  const filtered = (orders ?? []).filter((o) =>
    (filter === "all" || o.status === filter) &&
    (q === "" || o.service_name.toLowerCase().includes(q.toLowerCase()) || o.link.includes(q))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Mes commandes</h1>
        <p className="text-xs text-muted-foreground">Suivi en temps réel · actualisation auto</p>
      </div>

      <div className="glass rounded-xl p-3 flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher service ou lien…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="sm:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUS.map((s) => <SelectItem key={s} value={s}>{LABELS[s]}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {orders === null && Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20" />)}
        {orders && filtered.length === 0 && <div className="text-center py-12 text-sm text-muted-foreground">Aucune commande</div>}
        {filtered.map((o) => (
          <div key={o.id} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sm">{o.service_name}</div>
                <a href={o.link} target="_blank" rel="noreferrer" className="text-[11px] text-accent hover:underline truncate block max-w-xs">{o.link}</a>
                <div className="text-[11px] text-muted-foreground mt-0.5">Qté {o.quantity} · {new Date(o.created_at).toLocaleString("fr-FR")}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{formatPrice(o.total_price)}</div>
                <div className="text-[10px] mt-0.5">{LABELS[o.status]}</div>
              </div>
            </div>
            <Progress value={o.status === "completed" ? 100 : o.status === "in_progress" ? Math.max(o.progress, 35) : o.status === "pending" ? 10 : 0} className="mt-3 h-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}
