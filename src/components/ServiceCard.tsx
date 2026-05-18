import { Link } from "@tanstack/react-router";
import {
  Clock,
  Flame,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

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

const BADGES: Record<
  string,
  { label: string; icon: any; cls: string }
> = {
  top: {
    label: "TOP",
    icon: Flame,
    cls: "bg-orange-500/15 text-orange-400 border-orange-400/30",
  },

  new: {
    label: "NEW",
    icon: Sparkles,
    cls: "bg-cyan-500/15 text-cyan-400 border-cyan-400/30",
  },

  fast: {
    label: "FAST",
    icon: Zap,
    cls: "bg-primary/15 text-primary border-primary/30",
  },
};

export function ServiceCard({ s }: { s: Service }) {
  const B =
    s.badge && s.badge !== "none"
      ? BADGES[s.badge]
      : null;

  return (
    <div
      className="
      group
      relative
      overflow-hidden
      rounded-3xl
      glass
      border border-white/10
      p-5
      flex flex-col
      min-h-[230px]
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-[0_0_40px_rgba(0,200,255,0.25)]
    "
    >
      {/* Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      {/* Badge */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-base leading-tight line-clamp-2">
          {s.name}
        </h3>

        {B && (
          <span
            className={`
              ${B.cls}
              text-[10px]
              font-black
              px-2.5
              py-1
              rounded-full
              border
              inline-flex
              items-center
              gap-1
              shrink-0
            `}
          >
            <B.icon className="h-3 w-3" />
            {B.label}
          </span>
        )}
      </div>

      {/* Description */}
      {s.description && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {s.description}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-5">

        <div className="rounded-2xl bg-secondary/40 border border-white/5 p-3">
          <div className="text-[10px] uppercase text-muted-foreground">
            Prix /1000
          </div>

          <div className="mt-1 text-lg font-black text-gradient">
            {formatPrice(s.price_per_1k)}
          </div>
        </div>

        <div className="rounded-2xl bg-secondary/40 border border-white/5 p-3">
          <div className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Délai
          </div>

          <div className="mt-1 text-sm font-bold">
            {s.estimated_time}
          </div>
        </div>

      </div>

      {/* Premium line */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-green-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Service premium sécurisé
      </div>

      {/* Button */}
      <Button
        asChild
        className="
          mt-5
          h-11
          rounded-2xl
