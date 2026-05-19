import { Link } from "@tanstack/react-router";
import { Clock, Flame, Sparkles, Zap, ArrowRight, ShieldCheck } from "lucide-react";
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
  top:  { label: "TOP",  icon: Flame,    cls: "bg-orange-500/15 text-orange-400 border-orange-400/30" },
  new:  { label: "NEW",  icon: Sparkles, cls: "bg-cyan-500/15 text-cyan-400 border-cyan-400/30" },
  fast: { label: "FAST", icon: Zap,      cls: "bg-primary/15 text-primary border-primary/30" },
};

const PLATFORM_ICON: Record<string, string> = {
  facebook: "f",
  tiktok: "♪",
  instagram: "◉",
};

const PLATFORM_GRADIENT: Record<string, string> = {
  facebook: "from-blue-500/30 to-blue-700/10",
  tiktok: "from-pink-500/30 to-cyan-500/10",
  instagram: "from-fuchsia-500/30 to-orange-500/10",
};

export function ServiceCard({ s }: { s: Service }) {
  const B = s.badge && s.badge !== "none" ? BADGES[s.badge] : null;

  return (
    <Link
      to="/order/$serviceId"
      params={{ serviceId: s.id }}
      className="group relative h-full flex flex-col overflow-hidden rounded-3xl glass border border-white/10 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_0_28px_oklch(0.82_0.16_200/0.25)] active:scale-[0.98]"
    >
      {/* glow */}
      <div className={`pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-gradient-to-br ${PLATFORM_GRADIENT[s.platform]} blur-2xl opacity-60 group-hover:opacity-100 transition`} />

      {/* header */}
      <div className="relative flex items-start justify-between gap-2">
        <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center glow-soft font-black text-primary-foreground text-sm">
          {PLATFORM_ICON[s.platform]}
        </div>
        {B && (
          <span className={`${B.cls} text-[9px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1`}>
            <B.icon className="h-2.5 w-2.5" />{B.label}
          </span>
        )}
      </div>

      {/* title */}
      <h3 className="relative mt-2.5 font-bold text-[13px] leading-tight line-clamp-2 min-h-[2.2rem]">
        {s.name}
      </h3>

      {/* price */}
      <div className="relative mt-2">
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Prix /1k</div>
        <div className="text-lg font-black text-gradient leading-none mt-0.5">{formatPrice(s.price_per_1k)}</div>
      </div>

      {/* progress (visual quality bar) */}
      <div className="relative mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full w-[85%] gradient-primary rounded-full" />
      </div>

      {/* footer */}
      <div className="relative mt-2.5 flex items-center justify-between text-[10px]">
        <span className="inline-flex items-center gap-1 text-[oklch(0.72_0.18_155)]">
          <ShieldCheck className="h-3 w-3" />Sécurisé
        </span>
        {s.estimated_time && (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />{s.estimated_time}
          </span>
        )}
      </div>

      <div className="relative mt-2.5 h-9 rounded-2xl gradient-primary grid place-items-center text-primary-foreground text-xs font-bold glow-soft">
        Commander <ArrowRight className="h-3.5 w-3.5 ml-1" />
      </div>
    </Link>
  );
}
