import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AnnouncementBar() {
  const [items, setItems] = useState<{ id: string; content: string; title: string | null }[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, content, title")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const i = setInterval(() => setIdx((p) => (p + 1) % items.length), 4500);
    return () => clearInterval(i);
  }, [items.length]);

  if (items.length === 0) return null;
  const cur = items[idx];

  return (
    <div className="px-3 pt-3">
      <div className="relative overflow-hidden rounded-3xl border border-accent/20 glass-strong glow-soft p-4">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative flex items-start gap-3">
          <div className="h-8 w-8 shrink-0 rounded-2xl gradient-primary grid place-items-center glow-soft">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            {cur.title && <div className="text-[11px] uppercase font-bold tracking-wide text-accent">{cur.title}</div>}
            <div key={cur.id} className="text-sm text-foreground/90 fade-in leading-snug">{cur.content}</div>
          </div>
        </div>
        {items.length > 1 && (
          <div className="mt-3 flex justify-center gap-1">
            {items.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all ${i === idx ? "w-6 bg-accent" : "w-1.5 bg-white/20"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
