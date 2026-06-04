import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, ArrowLeft, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export const Route = createFileRoute("/_client/order/$serviceId")({
  component: OrderPage,
});

type Service = {
  id: string;
  name: string; description: string | null;
  price_per_1k: number; min_quantity: number; max_quantity: number;
  estimated_time: string | null; platform: string;
  available?: boolean | null; is_active?: boolean | null;
};

function OrderPage() {
  const { serviceId } = useParams({ from: "/_client/order/$serviceId" });
  const { user, profile, refresh } = useAuth();
  const navigate = useNavigate();
  const [svc, setSvc] = useState<Service | null>(null);
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("services").select("id, name, description, price_per_1k, min_quantity, max_quantity, estimated_time, platform, available, is_active")
      .eq("id", serviceId).maybeSingle().then(({ data }) => {
        const s = data as Service | null;
        setSvc(s);
        if (s) setQuantity(s.min_quantity);
      });
  }, [serviceId]);

  const total = useMemo(() => svc ? (svc.price_per_1k * quantity) / 1000 : 0, [svc, quantity]);
  const insufficient = (profile?.balance ?? 0) < total;
  const validLink = /^https?:\/\/.+/i.test(link);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!svc || !user) return;
    if (svc.is_active === false || svc.available === false)
      return toast.error("Service indisponible pour le moment");
    if (!validLink) return toast.error("Lien invalide");
    if (quantity < svc.min_quantity || quantity > svc.max_quantity)
      return toast.error(`Quantité entre ${svc.min_quantity} et ${svc.max_quantity}`);
    if (insufficient) return toast.error("Solde insuffisant — rechargez votre compte");

    setBusy(true);
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      service_id: svc.id,
      service_name: svc.name,
      link,
      quantity,
      unit_price: svc.price_per_1k,
      total_price: total,
      notes: notes || null,
    });
    if (error) { setBusy(false); return toast.error(error.message); }

    const newBalance = (profile?.balance ?? 0) - total;
    const { error: e2 } = await supabase.from("profiles").update({ balance: newBalance }).eq("id", user.id);
    if (e2) { setBusy(false); return toast.error("Erreur débit solde"); }

    await refresh();
    setBusy(false);
    toast.success("Commande envoyée ✨");
    navigate({ to: "/orders" });
  }

  if (!svc) return <div className="mx-auto max-w-2xl px-4 py-8 space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-16" />)}</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 fade-in pb-24">
      <Button asChild variant="ghost" size="sm" className="mb-3"><Link to="/app"><ArrowLeft className="h-4 w-4 mr-1.5" />Retour</Link></Button>

      <div className="glass-strong rounded-2xl p-5 mb-4">
        <div className="text-[10px] uppercase tracking-wider text-accent font-semibold">{svc.platform}</div>
        <h1 className="text-xl font-bold mt-1">{svc.name}</h1>
        {svc.description && <p className="text-sm text-muted-foreground mt-1">{svc.description}</p>}
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-secondary/50 rounded-lg px-2 py-1.5"><div className="text-muted-foreground text-[10px]">Prix /1k</div><div className="font-bold">{formatPrice(svc.price_per_1k)}</div></div>
          <div className="bg-secondary/50 rounded-lg px-2 py-1.5"><div className="text-muted-foreground text-[10px]">Min</div><div className="font-bold">{svc.min_quantity}</div></div>
          <div className="bg-secondary/50 rounded-lg px-2 py-1.5"><div className="text-muted-foreground text-[10px]">Délai</div><div className="font-bold">{svc.estimated_time}</div></div>
        </div>
      </div>

      <form onSubmit={submit} className="glass rounded-2xl p-5 space-y-4">
        <div>
          <Label htmlFor="link">Lien de la publication / profil</Label>
          <div className="relative mt-1"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="link" type="url" placeholder="https://..." required value={link} onChange={(e) => setLink(e.target.value)} className="pl-9" />
          </div>
          {link && !validLink && <p className="text-xs text-destructive mt-1">Lien invalide</p>}
        </div>

        <div>
          <Label htmlFor="qty">Quantité</Label>
          <Input id="qty" type="number" min={svc.min_quantity} max={svc.max_quantity} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          <p className="text-[11px] text-muted-foreground mt-1">Entre {svc.min_quantity} et {svc.max_quantity}</p>
        </div>

        <div>
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="glass rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Montant total</div>
            <div className="text-2xl font-bold text-gradient">{formatPrice(total)}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground">Solde</div>
            <div className={`text-sm font-semibold ${insufficient ? "text-destructive" : ""}`}>{formatPrice(profile?.balance ?? 0)}</div>
          </div>
        </div>

        {insufficient && (
          <Button asChild type="button" variant="outline" className="w-full border-destructive/40 text-destructive">
            <Link to="/recharge"><Wallet className="h-4 w-4 mr-1.5" />Recharger le solde</Link>
          </Button>
        )}

        <Button type="submit" disabled={busy || insufficient || !validLink} className="w-full gradient-primary text-primary-foreground glow-soft h-11">
          {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Envoyer la demande
        </Button>
      </form>
    </div>
  );
}
