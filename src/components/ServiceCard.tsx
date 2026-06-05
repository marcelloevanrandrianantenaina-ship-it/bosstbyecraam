import { Link } from "@tanstack/react-router";
import {
  Clock, Flame, Sparkles, Zap, ArrowRight, ShieldCheck, Crown,
  Heart, Eye, Users, MessageCircle, Share2, Play, UserPlus, ThumbsUp,
  Facebook, Instagram, Music2, Ban, TrendingUp, Pencil, Trash2,
} from "lucide-react";
import { formatPrice } from "@/lib/constants";

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price_per_1k: number;
  estimated_time: string | null;
  badge: "none" | "top" | "new" | "fast";
  platform: "facebook" | "tiktok" | "instagram";
  discount_pct?: number | null;
  popularity_pct?: number | null;
  available?: boolean | null;
};

const BADGES: Record<string, { label: string; icon: any; cls: string }> = {
  top:  { label: "TOP",   icon: Crown,    cls: "bg-primary/15 text-primary border-primary/40" },
  new:  { label: "ULTRA", icon: Sparkles, cls: "bg-accent/15 text-accent border-accent/40" },
  fast: { label: "RAPIDE", icon: Flame,   cls: "bg-orange-500/15 text-orange-300 border-orange-400/30" },
};

const PLATFORM_ICON: Record<string, any> = {
  facebook: Facebook,
  tiktok: Music2,
  instagram: Instagram,
};

const PLATFORM_GRADIENT: Record<string, string> = {
  facebook: "from-blue-400/25 to-indigo-500/10",
  tiktok: "from-pink-400/25 to-cyan-400/10",
  instagram: "from-fuchsia-400/25 to-orange-400/10",
};

function pickServiceIcon(name: string) {
  const n = name.toLowerCase();
  if (/(follower|abonn|fidy)/.test(n)) return UserPlus;
  if (/(comment|commentaire|hevitra)/.test(n)) return MessageCircle;
  if (/(vue|view|hijery)/.test(n)) return Eye;
  if (/(partage|share)/.test(n)) return Share2;
  if (/(play|écoute|stream)/.test(n)) return Play;
  if (/(like|j'aime|tia)/.test(n)) return ThumbsUp;
  if (/(react|réaction|reaction)/.test(n)) return Heart;
  if (/(membre|member|group)/.test(n)) return Users;
  return Sparkles;
}

export function ServiceCard({
  s,
  adminMode = false,
  onEdit,
  onDelete,
}: {
  s: Service;
  adminMode?: boolean;
  onEdit?: (s: Service) => void;
  onDelete?: (s: Service) => void;
}) {
  const B = s.badge && s.badge !== "none" ? BADGES[s.badge] : null;
  const time = s.estimated_time?.trim() || "1h";
  const PIcon = PLATFORM_ICON[s.platform] ?? Sparkles;
  const SIcon = pickServiceIcon(s.name);
  const discount = Math.max(0, Math.min(90, s.discount_pct ?? 0));
  const popularity = Math.max(0, Math.min(100, s.popularity_pct ?? 85));
  const unavailable = s.available === false;

  const oldPrice = discount > 0 ? s.price_per_1k / (1 - discount / 100) : null;

  const inner = (
    <>
      <div className={`pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-gradient-to-br ${PLATFORM_GRADIENT[s.platform]} blur-2xl opacity-60 group-hover:opacity-100 transition`} />

      {/* Top row: icon + badges */}
      <div className="relative flex items-start justify-between gap-2">
        <div className="relative">
          <div className="h-10 w-10 rounded-2xl gradient-primary grid place-items-center glow-soft text-primary-foreground">
            <SIcon className="h-5 w-5" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border border-white/15 grid place-items-center">
            <PIcon className="h-3 w-3 text-foreground" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {discount > 0 && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.55)] inline-flex items-center gap-1">
              <Flame className="h-2.5 w-2.5" />-{discount}%
            </span>
          )}
          {B && (
            <span className={`${B.cls} text-[9px] font-black px-2 py-0.5 rounded-full border inline-flex items-center gap-1`}>
              <B.icon className="h-2.5 w-2.5" />{B.label}
            </span>
          )}
        </div>
      </div>

      <h3 className="relative mt-2.5 font-bold text-[13px] leading-tight line-clamp-2 min-h-[2.2rem]">
        {s.name}
      </h3>

      {/* Price */}
      <div className="relative mt-2">
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Prix /1k</div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <div className="text-lg font-black text-gradient leading-none">{formatPrice(s.price_per_1k)}</div>
          {oldPrice && (
            <div className="text-[10px] line-through text-muted-foreground">{formatPrice(Math.round(oldPrice))}</div>
          )}
        </div>
      </div>

      {/* Delivery time */}
      <div className="relative mt-2 rounded-xl bg-accent/8 border border-accent/20 px-2 py-1.5">
        <div className="text-[10px] font-bold text-accent inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />Vita ao anatin'ny {time}
        </div>
      </div>

      {/* Popularity bar */}
      <div className="relative mt-2">
        <div className="flex items-center justify-between text-[9px] mb-1">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-2.5 w-2.5" />Popularité
          </span>
          <span className="font-black text-primary">{popularity}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-700"
            style={{ width: `${popularity}%` }}
          />
        </div>
      </div>

      <div className="relative mt-2 flex items-center justify-between text-[10px]">
        <span className="inline-flex items-center gap-1 text-[oklch(0.74_0.16_155)]">
          <ShieldCheck className="h-3 w-3" />Sécurisé
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Zap className="h-3 w-3 text-primary" />Instant
        </span>
      </div>

      {unavailable ? (
        <div className="relative mt-2.5 h-9 rounded-2xl bg-muted/30 border border-white/10 grid place-items-center text-muted-foreground text-xs font-black">
          <span className="inline-flex items-center gap-1.5"><Ban className="h-3.5 w-3.5" />Indisponible</span>
        </div>
      ) : (
        <div className="relative mt-2.5 h-9 rounded-2xl gradient-primary grid place-items-center text-primary-foreground text-xs font-black glow-soft">
          Commander <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </div>
      )}

      {unavailable && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-background/55 backdrop-blur-[1px] grid place-items-center">
          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-destructive/85 text-destructive-foreground border border-destructive/40 shadow-[0_0_14px_rgba(239,68,68,0.5)] inline-flex items-center gap-1">
            <Ban className="h-3 w-3" />Indisponible
          </span>
        </div>
      )}
    </>
  );

  const baseCls = "group relative h-full flex flex-col overflow-hidden rounded-3xl glass border border-white/10 p-3.5 transition-all duration-300";

  if (unavailable) {
    return (
      <div className={`${baseCls} opacity-95`} aria-disabled>
        {inner}
      </div>
    );
  }

  return (
    <Link
      to="/order/$serviceId"
      params={{ serviceId: s.id }}
      className={`${baseCls} hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_24px_oklch(0.78_0.17_65_/_0.25)] active:scale-[0.98]`}
    >
      {inner}
    </Link>
  );
}

