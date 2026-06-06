import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pin, Megaphone, Info, AlertTriangle, CheckCircle2, Sparkles, X } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  type: string;
  is_active: boolean;
  is_pinned: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

const TYPE_MAP: Record<string, { cls: string; icon: any; ring: string }> = {
  info: { cls: "text-accent", icon: Info, ring: "border-accent/40 bg-accent/8" },
  promo: { cls: "text-violet", icon: Sparkles, ring: "border-[oklch(0.68_0.22_295)]/40 bg-[oklch(0.68_0.22_295)]/10" },
  warning: { cls: "text-orange-300", icon: AlertTriangle, ring: "border-orange-400/40 bg-orange-500/10" },
  success: { cls: "text-primary", icon: CheckCircle2, ring: "border-primary/40 bg-primary/10" },
};

export function AnnouncementBanner() {
  const [rows, setRows] = useState<Announcement[] | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem("ann_dismissed") ?? "[]"));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    (async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("is_pinned", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      const list = ((data as any[]) ?? []).filter((a) => {
        if (a.starts_at && a.starts_at > nowIso) return false;
        if (a.ends_at && a.ends_at < nowIso) return false;
        return true;
      });
      setRows(list as Announcement[]);
    })();
  }, []);

  function dismiss(id: string) {
    const n = new Set(dismissed);
    n.add(id);
    setDismissed(n);
    if (typeof window !== "undefined") {
      localStorage.setItem("ann_dismissed", JSON.stringify(Array.from(n)));
    }
  }

  const visible = (rows ?? []).filter((a) => a.is_pinned || !dismissed.has(a.id));
  if (!rows || visible.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Megaphone className="h-3.5 w-3.5 text-violet" />
        <h2 className="text-[11px] uppercase tracking-wider font-black text-violet">
          Annonces
        </h2>
      </div>
      <div className="space-y-2 stagger">
        {visible.slice(0, 5).map((a) => {
          const meta = TYPE_MAP[a.type] ?? TYPE_MAP.info;
          const Icon = meta.icon;
          return (
            <div
              key={a.id}
              className={`relative rounded-2xl border ${meta.ring} p-3 pr-9`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`h-8 w-8 shrink-0 rounded-xl grid place-items-center ${meta.cls}`}>
                  {a.is_pinned ? <Pin className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-black leading-tight">{a.title}</h3>
                    {a.is_pinned && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[oklch(0.82_0.12_90)]/20 text-gold border border-[oklch(0.82_0.12_90)]/40">
                        ÉPINGLÉ
                      </span>
                    )}
                  </div>
                  {a.content && (
                    <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{a.content}</p>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                  </div>
                </div>
              </div>
              {!a.is_pinned && (
                <button
                  onClick={() => dismiss(a.id)}
                  aria-label="Fermer"
                  className="absolute top-2 right-2 h-6 w-6 rounded-lg hover:bg-white/10 grid place-items-center text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
