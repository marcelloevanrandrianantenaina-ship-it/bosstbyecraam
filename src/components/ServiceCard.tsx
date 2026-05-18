import { Link } from "@tanstack/react-router";
import { Clock, Flame, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/constants";

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price_per_1k: number;
  estimated_time: string | null;
  badge: "none" | "top" | "new" | "fast";
  platform: "facebook" | "tiktok" | "instagram";
};

const BADGES: Record<string, { label: string; icon: any; cls: string }> = {
  top: { label: "TOP", icon: Flame, cls: "bg-[oklch(0.65_0.22_25)]/15 text-[oklch(0.78_0.2_25)] border-[oklch(0.65_0.22_25)]/30" },
  new: { label: "NOUVEAU", icon: Sparkles, cls: "bg-accent/15 text-accent border-accent/30" },
  fast: { label: "RAPIDE", icon: Zap, cls: "bg-primary/15 text-primary border-primary/30" },
};

export function ServiceCard({ s }: { s: Service }) {
  const B = s.badge && s.badge !== "none" ? BADGES[s.badge] : null;
  return (
    <div className="group relative glass rounded-2xl p-4 hover-lift fade-in overflow-hidden flex flex-col h-full min-h-[180px]">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm leading-tight flex-1 break-words">{s.name}</h3>
        {B && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${B.cls} inline-flex items-center gap-1 shrink-0`}>
            <B.icon className="h-3 w-3" />{B.label}
          </span>
        )}
      </div>
      {s.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>}

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs mt-auto">
        <div className="rounded-lg bg-secondary/50 px-2.5 py-1.5 min-w-0">
          <div className="text-muted-foreground text-[10px] uppercase tracking-wide">Prix /1k</div>
          <div className="font-bold text-foreground truncate">{formatPrice(s.price_per_1k)}</div>
        </div>
        <div className="rounded-lg bg-secondary/50 px-2.5 py-1.5 min-w-0">
          <div className="text-muted-foreground text-[10px] uppercase tracking-wide flex items-center gap-1"><Clock className="h-3 w-3" />Délai</div>
          <div className="font-bold text-foreground truncate">{s.estimated_time}</div>
        </div>
      </div>

      <Button asChild size="sm" className="gradient-primary text-primary-foreground hover:opacity-90 h-9 w-full text-xs">
        <Link to="/order/$serviceId" params={{ serviceId: s.id }}>
          Commander <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </Button>
    </div>
  );
}
